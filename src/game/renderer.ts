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

  // Oak wood background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
  bgGrad.addColorStop(0, "#8B6914");
  bgGrad.addColorStop(0.3, "#A0782C");
  bgGrad.addColorStop(0.5, "#7A5B10");
  bgGrad.addColorStop(0.7, "#9E7624");
  bgGrad.addColorStop(1, "#6B5010");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Wood grain lines
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#3E2700";
  ctx.lineWidth = 1;
  for (let y = 8; y < TABLE_HEIGHT; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < TABLE_WIDTH; x += 30) {
      ctx.lineTo(x + 15, y + Math.sin(x * 0.05 + y * 0.02) * 2);
    }
    ctx.lineTo(TABLE_WIDTH, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Oak perimeter border
  const bw = 10;
  const perimGrad = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  perimGrad.addColorStop(0, "#5C3D0E");
  perimGrad.addColorStop(0.25, "#7A5220");
  perimGrad.addColorStop(0.5, "#8B6328");
  perimGrad.addColorStop(0.75, "#6E4818");
  perimGrad.addColorStop(1, "#4A3008");
  ctx.strokeStyle = perimGrad;
  ctx.lineWidth = bw;
  ctx.strokeRect(bw / 2, bw / 2, TABLE_WIDTH - bw, TABLE_HEIGHT - bw);
  // Inner bevel highlight
  ctx.strokeStyle = "rgba(210,170,100,0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bw + 1, bw + 1, TABLE_WIDTH - bw * 2 - 2, TABLE_HEIGHT - bw * 2 - 2);
  // Outer shadow
  ctx.strokeStyle = "rgba(30,15,0,0.6)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, TABLE_WIDTH - 2, TABLE_HEIGHT - 2);

  // Collect bodies to skip in generic wall drawing
  const skipBodies = new Set<number>();
  for (const b of bodies.bumpers) skipBodies.add(b.handle);
  for (const s of bodies.slings) skipBodies.add(s.handle);
  for (const k of bodies.kickers) skipBodies.add(k.handle);
  for (const lg of bodies.laneGuides) skipBodies.add(lg.handle);
  for (const ct of bodies.cardTargets) skipBodies.add(ct.handle);
  for (const it of bodies.iconTargets) skipBodies.add(it.handle);
  for (const t of bodies.trampolines) skipBodies.add(t.handle);

  // Draw walls (static colliders) — dark oak wood
  world.forEachCollider((collider) => {
    const parent = collider.parent();
    if (!parent || parent.bodyType() !== RAPIER.RigidBodyType.Fixed) return;
    if (skipBodies.has(parent.handle)) return;

    const shape = collider.shape;
    if (shape.type === RAPIER.ShapeType.Ball) return;

    const pos = parent.translation();
    const rot = parent.rotation();
    const halfExtents = (shape as RAPIER.Cuboid).halfExtents;
    const sx = toScreen(pos.x);
    const sy = toScreen(pos.y);
    const w2 = toScreen(halfExtents.x);
    const h2 = toScreen(halfExtents.y);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);

    // Dark oak fill
    const wallGrad = ctx.createLinearGradient(-w2, -h2, w2, h2);
    wallGrad.addColorStop(0, "#4A3008");
    wallGrad.addColorStop(0.5, "#5C3D12");
    wallGrad.addColorStop(1, "#3E2800");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-w2, -h2, w2 * 2, h2 * 2);

    // Subtle wood grain on walls
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "#2A1A00";
    ctx.lineWidth = 0.5;
    for (let gy = -h2 + 3; gy < h2; gy += 5) {
      ctx.beginPath();
      ctx.moveTo(-w2, gy);
      ctx.lineTo(w2, gy + Math.sin(gy * 0.3) * 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Edge highlight
    ctx.strokeStyle = "rgba(180,130,60,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w2, -h2, w2 * 2, h2 * 2);

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

  // Draw trampolines
  for (const tramp of bodies.trampolines) {
    const pos = tramp.translation();
    const rot = tramp.rotation();
    const col = tramp.collider(0);
    if (!col) continue;
    const he = (col.shape as RAPIER.Cuboid).halfExtents;
    const tw = toScreen(he.x);
    const th = toScreen(he.y);
    const tx = toScreen(pos.x);
    const ty = toScreen(pos.y);

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(rot);

    // Green spring bar
    const tGrad = ctx.createLinearGradient(-tw, -th, tw, th);
    tGrad.addColorStop(0, "#16a34a");
    tGrad.addColorStop(0.5, "#4ade80");
    tGrad.addColorStop(1, "#16a34a");
    ctx.fillStyle = tGrad;
    ctx.fillRect(-tw, -th, tw * 2, th * 2);

    // Spring coil lines
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 1.5;
    const coils = 5;
    for (let i = 1; i < coils; i++) {
      const lx = -tw + (tw * 2 * i) / coils;
      ctx.beginPath();
      ctx.moveTo(lx, -th);
      ctx.lineTo(lx, th);
      ctx.stroke();
    }

    // Edge glow
    ctx.strokeStyle = "rgba(134, 239, 172, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-tw, -th, tw * 2, th * 2);

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
    const cRot = bodies.cardTargets[i].rotation();
    ctx.rotate(cRot);

    // Glow when hit
    if (hit) {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 20;
    }

    // Card shape (80% of original)
    ctx.beginPath();
    ctx.roundRect(-34, -24, 68, 48, 5);
    ctx.fillStyle = hit ? "#fef3c7" : "#1e293b";
    ctx.fill();
    ctx.strokeStyle = hit ? "#f59e0b" : "#475569";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Card label
    ctx.font = "bold 22px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Color suits: red for hearts/diamonds, dark for spades/clubs
    const isRed = label.includes("\u2665") || label.includes("\u2666");
    ctx.fillStyle = hit ? (isRed ? "#dc2626" : "#111827") : (isRed ? "#f87171" : "#94a3b8");
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  // Draw icon targets (Jokers) — same size as cards
  for (let i = 0; i < bodies.iconTargets.length; i++) {
    const it = bodies.iconTargets[i];
    const pos = it.translation();
    const sx = toScreen(pos.x);
    const sy = toScreen(pos.y);
    const hit = bodies.iconHitState[i];
    const label = iconLabels[i] ?? "?";

    ctx.save();
    ctx.translate(sx, sy);
    const iRot = bodies.iconTargets[i].rotation();
    ctx.rotate(iRot);

    if (hit) {
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 20;
    }

    // Joker tile (same size as cards)
    ctx.beginPath();
    ctx.roundRect(-34, -24, 68, 48, 5);
    ctx.fillStyle = hit ? "#e9d5ff" : "#1e1b4b";
    ctx.fill();
    ctx.strokeStyle = hit ? "#a855f7" : "#4c1d95";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icon label
    ctx.font = "22px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = hit ? "#7c3aed" : "#8b5cf6";
    ctx.fillText(label, 0, 0);

    // +1K flash when hit
    if (hit) {
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("+1K", 0, -30);
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

  const hw = FLIPPER_WIDTH / 2;
  const baseH = FLIPPER_HEIGHT / 2;
  const tipH = FLIPPER_TIP_HEIGHT / 2;

  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(-hw, -baseH);
    ctx.lineTo(hw, -tipH);
    ctx.lineTo(hw, tipH);
    ctx.lineTo(-hw, baseH);
  } else {
    ctx.moveTo(hw, -baseH);
    ctx.lineTo(-hw, -tipH);
    ctx.lineTo(-hw, tipH);
    ctx.lineTo(hw, baseH);
  }
  ctx.closePath();

  // Marble base gradient
  const grad = ctx.createLinearGradient(-hw, -baseH, hw, baseH);
  grad.addColorStop(0, "#1e3a5f");
  grad.addColorStop(0.2, "#2d5a8a");
  grad.addColorStop(0.35, "#1a4570");
  grad.addColorStop(0.5, "#3b7dc0");
  grad.addColorStop(0.65, "#1e4d80");
  grad.addColorStop(0.8, "#2a6399");
  grad.addColorStop(1, "#163050");
  ctx.fillStyle = grad;
  ctx.fill();

  // Marble veins
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(180, 210, 240, 0.15)";
  ctx.lineWidth = 0.8;
  for (let v = 0; v < 5; v++) {
    const yOff = -baseH + (v + 0.5) * (baseH * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(-hw, yOff);
    ctx.bezierCurveTo(-hw * 0.3, yOff - 3, hw * 0.3, yOff + 4, hw, yOff - 1);
    ctx.stroke();
  }
  // Subtle white streaks
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.6, -baseH * 0.3);
  ctx.bezierCurveTo(-hw * 0.1, -baseH * 0.5, hw * 0.3, baseH * 0.2, hw * 0.7, -baseH * 0.1);
  ctx.stroke();
  ctx.restore();

  // Glossy edge
  ctx.strokeStyle = "rgba(147, 197, 253, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pivot dot
  const pivotX = isLeft ? -hw : hw;
  ctx.beginPath();
  ctx.arc(pivotX, 0, 3.5, 0, Math.PI * 2);
  const pivotGrad = ctx.createRadialGradient(pivotX, 0, 0, pivotX, 0, 3.5);
  pivotGrad.addColorStop(0, "#e0e7ff");
  pivotGrad.addColorStop(1, "#6366f1");
  ctx.fillStyle = pivotGrad;
  ctx.fill();

  ctx.restore();
}
