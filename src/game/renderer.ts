import RAPIER from "@dimforge/rapier2d-compat";
import { GameBodies } from "./setupTable";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS_PX,
  BUMPER_RADIUS_PX,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  FLIPPER_TIP_HEIGHT,
  toScreen,
} from "../constants";

export function render(
  ctx: CanvasRenderingContext2D,
  world: RAPIER.World,
  bodies: GameBodies,
  score: number,
  cardLabels: string[] = [],
  iconLabels: string[] = []
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

  // Draw slingshots
  for (const sling of bodies.slings) {
    const pos = sling.translation();
    const rot = sling.rotation();
    ctx.save();
    ctx.translate(toScreen(pos.x), toScreen(pos.y));
    ctx.rotate(rot);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(-45, -4, 90, 8);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-45, -4, 90, 8);
    ctx.restore();
  }

  // Draw kickers
  for (const kicker of bodies.kickers) {
    const pos = kicker.translation();
    ctx.beginPath();
    ctx.arc(toScreen(pos.x), toScreen(pos.y), 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(toScreen(pos.x), toScreen(pos.y), 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw lane guides
  for (const lg of bodies.laneGuides) {
    const pos = lg.translation();
    const rot = lg.rotation();
    ctx.save();
    ctx.translate(toScreen(pos.x), toScreen(pos.y));
    ctx.rotate(rot);
    // Get collider shape for dimensions
    const col = lg.collider(0);
    if (col) {
      const he = (col.shape as RAPIER.Cuboid).halfExtents;
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(-toScreen(he.x), -toScreen(he.y), toScreen(he.x) * 2, toScreen(he.y) * 2);
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 1;
      ctx.strokeRect(-toScreen(he.x), -toScreen(he.y), toScreen(he.x) * 2, toScreen(he.y) * 2);
    }
    ctx.restore();
  }

  // Draw flippers
  drawFlipper(ctx, bodies.leftFlipper, true);
  drawFlipper(ctx, bodies.rightFlipper, false);

  // Draw ball — metallic chrome look
  const ballPos = bodies.ball.translation();
  const bx = toScreen(ballPos.x);
  const by = toScreen(ballPos.y);
  ctx.beginPath();
  ctx.arc(bx, by, BALL_RADIUS_PX, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(
    bx - BALL_RADIUS_PX * 0.3,
    by - BALL_RADIUS_PX * 0.3,
    BALL_RADIUS_PX * 0.1,
    bx,
    by,
    BALL_RADIUS_PX
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.4, "#d1d5db");
  gradient.addColorStop(0.8, "#9ca3af");
  gradient.addColorStop(1, "#6b7280");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Draw card targets
  for (let i = 0; i < bodies.cardTargets.length; i++) {
    const ct = bodies.cardTargets[i];
    const pos = ct.translation();
    const sx = toScreen(pos.x);
    const sy = toScreen(pos.y);
    const hit = bodies.cardHitState[i];
    const label = cardLabels[i] ?? "?";

    // Card background
    ctx.save();
    ctx.translate(sx, sy);

    // Glow when hit
    if (hit) {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 12;
    }

    // Card shape
    ctx.beginPath();
    ctx.roundRect(-14, -10, 28, 20, 3);
    ctx.fillStyle = hit ? "#fef3c7" : "#1e293b";
    ctx.fill();
    ctx.strokeStyle = hit ? "#f59e0b" : "#475569";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Card label
    ctx.font = "bold 11px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Color suits: red for hearts/diamonds, dark for spades/clubs
    const isRed = label.includes("\u2665") || label.includes("\u2666");
    ctx.fillStyle = hit ? (isRed ? "#dc2626" : "#111827") : (isRed ? "#f87171" : "#94a3b8");
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  // Draw icon targets (Jokers)
  for (let i = 0; i < bodies.iconTargets.length; i++) {
    const it = bodies.iconTargets[i];
    const pos = it.translation();
    const sx = toScreen(pos.x);
    const sy = toScreen(pos.y);
    const hit = bodies.iconHitState[i];
    const label = iconLabels[i] ?? "?";

    ctx.save();
    ctx.translate(sx, sy);

    if (hit) {
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 14;
    }

    // Circle background
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = hit ? "#e9d5ff" : "#1e1b4b";
    ctx.fill();
    ctx.strokeStyle = hit ? "#a855f7" : "#4c1d95";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icon label
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = hit ? "#7c3aed" : "#8b5cf6";
    ctx.fillText(label, 0, 1);

    // +1K flash when hit
    if (hit) {
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText("+1K", 0, -20);
    }

    ctx.restore();
  }

  // Jackpot animation
  if (bodies.jackpotTimer > 0) {
    const t = bodies.jackpotTimer;
    const alpha = Math.min(t / 30, 1) * (t > 60 ? (120 - t) / 60 : 1);
    const scale = 1 + Math.sin(t * 0.15) * 0.15;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(TABLE_WIDTH / 2, TABLE_HEIGHT * 0.35);
    ctx.scale(scale, scale);

    // Glow burst
    const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
    glow.addColorStop(0, "rgba(251, 191, 36, 0.6)");
    glow.addColorStop(0.5, "rgba(251, 191, 36, 0.15)");
    glow.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-120, -120, 240, 240);

    // JACKPOT text
    ctx.font = "bold 42px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 4;
    ctx.strokeText("JACKPOT!", 0, -15);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("JACKPOT!", 0, -15);

    // +10,000 text
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#fef3c7";
    ctx.fillText("+10,000", 0, 18);

    // Card suits flying around
    const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
    ctx.font = "24px serif";
    for (let i = 0; i < 4; i++) {
      const angle = (t * 0.05) + (i * Math.PI / 2);
      const r = 60 + Math.sin(t * 0.1 + i) * 15;
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r;
      ctx.fillStyle = (i === 1 || i === 2) ? "#ef4444" : "#f9fafb";
      ctx.fillText(suits[i], sx, sy);
    }

    ctx.restore();
  }

  // Score
  ctx.fillStyle = "#f9fafb";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`SCORE: ${score}`, TABLE_WIDTH / 2, 30);

  // Controls hint
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px monospace";
  ctx.fillText("\u2190 Left Flipper  |  \u2192 Right Flipper  |  SPACE Launch", TABLE_WIDTH / 2, TABLE_HEIGHT - 10);
}

function drawFlipper(ctx: CanvasRenderingContext2D, flipper: RAPIER.RigidBody, isLeft: boolean) {
  const pos = flipper.translation();
  const rot = flipper.rotation();

  ctx.save();
  ctx.translate(toScreen(pos.x), toScreen(pos.y));
  ctx.rotate(rot);

  // Tapered flipper shape: wide at pivot end, narrow at tip
  const hw = FLIPPER_WIDTH / 2;
  const baseH = FLIPPER_HEIGHT / 2;
  const tipH = FLIPPER_TIP_HEIGHT / 2;

  ctx.beginPath();
  if (isLeft) {
    // Pivot on left, tip on right
    ctx.moveTo(-hw, -baseH);
    ctx.lineTo(hw, -tipH);
    ctx.lineTo(hw, tipH);
    ctx.lineTo(-hw, baseH);
  } else {
    // Pivot on right, tip on left
    ctx.moveTo(hw, -baseH);
    ctx.lineTo(-hw, -tipH);
    ctx.lineTo(-hw, tipH);
    ctx.lineTo(hw, baseH);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
  grad.addColorStop(0, isLeft ? "#3b82f6" : "#2563eb");
  grad.addColorStop(1, isLeft ? "#2563eb" : "#3b82f6");
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pivot dot
  const pivotX = isLeft ? -hw : hw;
  ctx.beginPath();
  ctx.arc(pivotX, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#93c5fd";
  ctx.fill();

  ctx.restore();
}
