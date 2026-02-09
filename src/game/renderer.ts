import RAPIER from "@dimforge/rapier2d-compat";
import { GameBodies } from "./setupTable";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS_PX,
  BUMPER_RADIUS_PX,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  toScreen,
} from "../constants";

export function render(
  ctx: CanvasRenderingContext2D,
  world: RAPIER.World,
  bodies: GameBodies,
  score: number
) {
  ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Draw walls (static colliders)
  ctx.fillStyle = "#374151";
  world.forEachCollider((collider) => {
    const parent = collider.parent();
    if (!parent || parent.bodyType() !== RAPIER.RigidBodyType.Fixed) return;

    // Skip bumpers (drawn separately)
    const shape = collider.shape;
    if (shape.type === RAPIER.ShapeType.Ball) return;

    const pos = parent.translation();
    const rot = parent.rotation();
    const halfExtents = (shape as RAPIER.Cuboid).halfExtents;

    ctx.save();
    ctx.translate(toScreen(pos.x), toScreen(pos.y));
    ctx.rotate(rot);
    ctx.fillRect(
      -toScreen(halfExtents.x),
      -toScreen(halfExtents.y),
      toScreen(halfExtents.x) * 2,
      toScreen(halfExtents.y) * 2
    );
    ctx.restore();
  });

  // Draw bumpers
  for (const bumper of bodies.bumpers) {
    const pos = bumper.translation();
    ctx.beginPath();
    ctx.arc(toScreen(pos.x), toScreen(pos.y), BUMPER_RADIUS_PX, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw flippers
  drawFlipper(ctx, bodies.leftFlipper);
  drawFlipper(ctx, bodies.rightFlipper);

  // Draw ball
  const ballPos = bodies.ball.translation();
  ctx.beginPath();
  ctx.arc(toScreen(ballPos.x), toScreen(ballPos.y), BALL_RADIUS_PX, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(
    toScreen(ballPos.x) - 3,
    toScreen(ballPos.y) - 3,
    1,
    toScreen(ballPos.x),
    toScreen(ballPos.y),
    BALL_RADIUS_PX
  );
  gradient.addColorStop(0, "#e5e7eb");
  gradient.addColorStop(1, "#9ca3af");
  ctx.fillStyle = gradient;
  ctx.fill();

  // Score
  ctx.fillStyle = "#f9fafb";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`SCORE: ${score}`, TABLE_WIDTH / 2, 30);

  // Controls hint
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px monospace";
  ctx.fillText("← Left Flipper  |  → Right Flipper  |  SPACE Launch", TABLE_WIDTH / 2, TABLE_HEIGHT - 10);
}

function drawFlipper(ctx: CanvasRenderingContext2D, flipper: RAPIER.RigidBody) {
  const pos = flipper.translation();
  const rot = flipper.rotation();

  ctx.save();
  ctx.translate(toScreen(pos.x), toScreen(pos.y));
  ctx.rotate(rot);

  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.roundRect(
    -FLIPPER_WIDTH / 2,
    -FLIPPER_HEIGHT / 2,
    FLIPPER_WIDTH,
    FLIPPER_HEIGHT,
    FLIPPER_HEIGHT / 2
  );
  ctx.fill();

  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
