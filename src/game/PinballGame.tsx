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
      bodies.leftFlipper.setAngvel(lAngle > L_MIN ? -FLIP_SPEED : 0, true);
    } else {
      bodies.leftFlipper.setAngvel(lAngle < L_MAX ? FLIP_SPEED : 0, true);
    }

    const rAngle = bodies.rightFlipper.rotation();
    if (rightPressed) {
      bodies.rightFlipper.setAngvel(rAngle < R_MAX ? FLIP_SPEED : 0, true);
    } else {
      bodies.rightFlipper.setAngvel(rAngle > R_MIN ? -FLIP_SPEED : 0, true);
    }

    // Step physics
    world.step();

    // Check if ball fell through drain
    const ballPos = bodies.ball.translation();
    if (ballPos.y > px(TABLE_HEIGHT + 50)) {
      resetBall(bodies.ball, TABLE_WIDTH);
    }

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
      if (dx * dx + dy * dy < px(22) * px(22)) {
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

    // Icon target hits (1000 pts each, one-time)
    for (let i = 0; i < bodies.iconTargets.length; i++) {
      if (bodies.iconHitState[i]) continue;
      const it = bodies.iconTargets[i];
      const iPos = it.translation();
      const dix = ballPos.x - iPos.x;
      const diy = ballPos.y - iPos.y;
      if (dix * dix + diy * diy < px(22) * px(22)) {
        const vel = bodies.ball.linvel();
        if (vel.x * vel.x + vel.y * vel.y > 1.5) {
          bodies.iconHitState[i] = true;
          scoreRef.current += 1000;
          setScore(scoreRef.current);
        }
      }
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
        ball.applyImpulse(
          new RAPIER.Vector2(
            (Math.random() - 0.5) * 0.15,
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
    </div>
  );
}
