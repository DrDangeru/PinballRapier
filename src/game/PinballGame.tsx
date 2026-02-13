import { useEffect, useRef, useCallback, useState } from "react";
import RAPIER from "@dimforge/rapier2d-compat";
import { useRapier } from "../hooks/useRapier";
import { GameBodies, resetBall } from "./setupTable";
import { buildLevel } from "../levels/buildLevel";
import { LevelConfig } from "../levels/types";
import { render } from "./renderer";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  PLUNGER_FORCE,
  px,
} from "../constants";

interface Props {
  level: LevelConfig;
  onBack: () => void;
}

export default function PinballGame({ level, onBack }: Props) {
  const { rapier, world } = useRapier();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<GameBodies | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [_score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);
  const animRef = useRef<number>(0);

  const gameLoop = useCallback(() => {
    if (!world || !bodiesRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const bodies = bodiesRef.current;
    const keys = keysRef.current;

    // Flipper controls — manually clamp angle, no joint limits
    const FLIP_SPEED = 22.5;
    const L_MIN = -0.3;
    const L_MAX = 0.8;
    const R_MIN = -0.8;
    const R_MAX = 0.3;

    const leftPressed = keys.has("ArrowLeft") || keys.has("z") || keys.has("Z");
    const rightPressed = keys.has("ArrowRight") || keys.has("/");

    const lAngle = bodies.leftFlipper.rotation();
    if (leftPressed) {
      if (lAngle > L_MIN) {
        bodies.leftFlipper.setAngvel(-FLIP_SPEED, true);
      } else {
        bodies.leftFlipper.setAngvel(0, true);
        bodies.leftFlipper.setRotation(L_MIN, true);
      }
    } else {
      if (lAngle < L_MAX) {
        bodies.leftFlipper.setAngvel(FLIP_SPEED, true);
      } else {
        bodies.leftFlipper.setAngvel(0, true);
        bodies.leftFlipper.setRotation(L_MAX, true);
      }
    }

    const rAngle = bodies.rightFlipper.rotation();
    if (rightPressed) {
      if (rAngle < R_MAX) {
        bodies.rightFlipper.setAngvel(FLIP_SPEED, true);
      } else {
        bodies.rightFlipper.setAngvel(0, true);
        bodies.rightFlipper.setRotation(R_MAX, true);
      }
    } else {
      if (rAngle > R_MIN) {
        bodies.rightFlipper.setAngvel(-FLIP_SPEED, true);
      } else {
        bodies.rightFlipper.setAngvel(0, true);
        bodies.rightFlipper.setRotation(R_MIN, true);
      }
    }

    // Step physics
    world.step();

    // Check if ball fell through drain
    const ballPos = bodies.ball.translation();
    if (ballPos.y > px(TABLE_HEIGHT + 50)) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        gameOverRef.current = true;
        setGameOver(true);
        return; // stop the loop
      }
      resetBall(bodies.ball, TABLE_WIDTH);
    }

    if (gameOverRef.current) return;

    // Proximity-based scoring helper
    const checkHit = (body: RAPIER.RigidBody, hitDist: number, points: number) => {
      const bPos = body.translation();
      const dx = ballPos.x - bPos.x;
      const dy = ballPos.y - bPos.y;
      if (dx * dx + dy * dy < px(hitDist) * px(hitDist)) {
        const vel = bodies.ball.linvel();
        if (vel.x * vel.x + vel.y * vel.y > 2) {
          scoreRef.current += points;
          setScore(scoreRef.current);
        }
      }
    };

    // Bumper hits (100 pts)
    for (const bumper of bodies.bumpers) checkHit(bumper, 30, 100);
    // Slingshot hits (50 pts)
    for (const sling of bodies.slings) checkHit(sling, 50, 50);
    // Kicker hits (200 pts)
    for (const kicker of bodies.kickers) checkHit(kicker, 20, 200);

    // Card target hits (500 pts each, jackpot if all 4 hit)
    for (let i = 0; i < bodies.cardTargets.length; i++) {
      if (bodies.cardHitState[i]) continue;
      const ct = bodies.cardTargets[i];
      const cPos = ct.translation();
      const dx = ballPos.x - cPos.x;
      const dy = ballPos.y - cPos.y;
      if (dx * dx + dy * dy < px(50) * px(50)) {
        const vel = bodies.ball.linvel();
        if (vel.x * vel.x + vel.y * vel.y > 1.5) {
          bodies.cardHitState[i] = true;
          scoreRef.current += 500;
          setScore(scoreRef.current);

          // Check for jackpot (all cards hit)
          if (bodies.cardHitState.every(Boolean) && !bodies.jackpotTriggered) {
            bodies.jackpotTriggered = true;
            bodies.jackpotTimer = 120; // ~2 seconds at 60fps
            scoreRef.current += 10000;
            setScore(scoreRef.current);
          }
        }
      }
    }

    // Icon target hits (1000 pts each, reset when all hit)
    for (let i = 0; i < bodies.iconTargets.length; i++) {
      if (bodies.iconHitState[i]) continue;
      const it = bodies.iconTargets[i];
      const iPos = it.translation();
      const dix = ballPos.x - iPos.x;
      const diy = ballPos.y - iPos.y;
      const distSq = dix * dix + diy * diy;
      const hitRadSq = px(50) * px(50);
      if (distSq < hitRadSq) {
        bodies.iconHitState[i] = true;
        scoreRef.current += 1000;
        setScore(scoreRef.current);
      }
    }
    // Reset jokers when all are hit
    if (bodies.iconHitState.length > 0 && bodies.iconHitState.every(Boolean)) {
      bodies.iconHitState.fill(false);
    }

    // Tick jackpot animation
    if (bodies.jackpotTimer > 0) {
      bodies.jackpotTimer--;
      if (bodies.jackpotTimer <= 0) {
        // Reset cards for next round
        bodies.cardHitState.fill(false);
        bodies.jackpotTriggered = false;
      }
    }

    // Render
    const cardLbls = (level.cardTargets ?? []).map((ct) => ct.label);
    const iconLbls = (level.iconTargets ?? []).map((it) => it.label);
    render(ctx, world, bodies, scoreRef.current, cardLbls, iconLbls);

    animRef.current = requestAnimationFrame(gameLoop);
  }, [world, level]);

  // Initialize game bodies
  useEffect(() => {
    if (!rapier || !world) return;

    bodiesRef.current = buildLevel(world, level);
    animRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [rapier, world, gameLoop]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      // Plunger / launch
      if (e.key === " " && bodiesRef.current) {
        e.preventDefault();
        const ball = bodiesRef.current.ball;
        const sideKick = (Math.random() - 0.5) * 1.2;
        ball.applyImpulse(
          new RAPIER.Vector2(
            sideKick,
            -PLUNGER_FORCE / 37.5
          ),
          true
        );
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  if (!rapier) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 text-lg font-mono">
        Loading physics engine...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded text-sm font-mono"
        >
          ← Editor
        </button>
        <h1 className="text-2xl font-bold text-white font-mono tracking-widest">
          {level.name}
        </h1>
        <div className="flex gap-1 text-lg">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={i < lives ? "text-red-500" : "text-gray-700"}>
              ♥
            </span>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        className="border-2 border-gray-700 rounded-lg shadow-2xl shadow-blue-900/30"
      />
      <p className="text-gray-500 text-sm font-mono">
        Press SPACE to launch • Arrow keys for flippers
      </p>

      {/* Game Over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center flex flex-col gap-4 shadow-2xl">
            <h2 className="text-4xl font-bold text-red-500 font-mono tracking-widest">GAME OVER</h2>
            <p className="text-2xl text-yellow-400 font-mono">Score: {_score.toLocaleString()}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => {
                  scoreRef.current = 0;
                  setScore(0);
                  livesRef.current = 3;
                  setLives(3);
                  gameOverRef.current = false;
                  setGameOver(false);
                  if (bodiesRef.current) {
                    resetBall(bodiesRef.current.ball, TABLE_WIDTH);
                    bodiesRef.current.cardHitState.fill(false);
                    bodiesRef.current.iconHitState.fill(false);
                    bodiesRef.current.jackpotTriggered = false;
                    bodiesRef.current.jackpotTimer = 0;
                  }
                  animRef.current = requestAnimationFrame(gameLoop);
                }}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-lg text-sm font-mono"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-mono"
              >
                Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
