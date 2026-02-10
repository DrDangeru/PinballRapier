import { LevelConfig } from "../levels/types";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BUMPER_RADIUS_PX,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  FLIPPER_TIP_HEIGHT,
  BALL_RADIUS_PX,
} from "../constants";

export function renderEditor(
  ctx: CanvasRenderingContext2D,
  level: LevelConfig,
  selectedId: string | null,
  hoverPos: { x: number; y: number } | null,
  activeTool: string
) {
  ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Grid
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < TABLE_WIDTH; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TABLE_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < TABLE_HEIGHT; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TABLE_WIDTH, y);
    ctx.stroke();
  }

  // Walls
  for (const wall of level.walls) {
    const isSelected = wall.id === selectedId;
    ctx.save();
    ctx.translate(wall.cx, wall.cy);
    ctx.rotate(wall.rotation ?? 0);
    ctx.fillStyle = isSelected ? "#6b7280" : "#374151";
    ctx.fillRect(-wall.hw, -wall.hh, wall.hw * 2, wall.hh * 2);
    if (isSelected) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.strokeRect(-wall.hw, -wall.hh, wall.hw * 2, wall.hh * 2);
    }
    ctx.restore();
  }

  // Bumpers
  for (const bumper of level.bumpers) {
    const isSelected = bumper.id === selectedId;
    const r = bumper.radius ?? BUMPER_RADIUS_PX;
    ctx.beginPath();
    ctx.arc(bumper.cx, bumper.cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? "#fbbf24" : "#f59e0b";
    ctx.fill();
    if (isSelected) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Flippers (tapered shape)
  for (const flipper of level.flippers) {
    const isSelected = flipper.id === selectedId;
    ctx.save();
    ctx.translate(flipper.anchorX, flipper.anchorY);
    ctx.fillStyle = isSelected ? "#60a5fa" : "#3b82f6";
    ctx.beginPath();
    const baseH = FLIPPER_HEIGHT / 2;
    const tipH = FLIPPER_TIP_HEIGHT / 2;
    if (flipper.isLeft) {
      ctx.moveTo(0, -baseH);
      ctx.lineTo(FLIPPER_WIDTH, -tipH);
      ctx.lineTo(FLIPPER_WIDTH, tipH);
      ctx.lineTo(0, baseH);
    } else {
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-FLIPPER_WIDTH, -tipH);
      ctx.lineTo(-FLIPPER_WIDTH, tipH);
      ctx.lineTo(0, baseH);
    }
    ctx.closePath();
    ctx.fill();
    if (isSelected) {
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // Anchor dot
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();
  }

  // Slingshots
  for (const sling of level.slings ?? []) {
    const isSelected = sling.id === selectedId;
    ctx.save();
    ctx.translate(sling.cx, sling.cy);
    ctx.rotate(sling.rotation ?? 0);
    ctx.fillStyle = isSelected ? "#fb923c" : "#f97316";
    ctx.fillRect(-45, -4, 90, 8);
    if (isSelected) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.strokeRect(-45, -4, 90, 8);
    }
    ctx.restore();
  }

  // Kickers
  for (const kicker of level.kickers ?? []) {
    const isSelected = kicker.id === selectedId;
    const r = kicker.radius ?? 12;
    ctx.beginPath();
    ctx.arc(kicker.cx, kicker.cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? "#f87171" : "#ef4444";
    ctx.fill();
    if (isSelected) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(kicker.cx, kicker.cy, r * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Lane guides
  for (const lg of level.laneGuides ?? []) {
    const isSelected = lg.id === selectedId;
    ctx.save();
    ctx.translate(lg.cx, lg.cy);
    ctx.rotate(lg.rotation ?? 0);
    ctx.fillStyle = isSelected ? "#6b7280" : "#4b5563";
    ctx.fillRect(-lg.hw, -lg.hh, lg.hw * 2, lg.hh * 2);
    if (isSelected) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.strokeRect(-lg.hw, -lg.hh, lg.hw * 2, lg.hh * 2);
    }
    ctx.restore();
  }

  // Ball spawn
  ctx.beginPath();
  ctx.arc(level.ballSpawn.x, level.ballSpawn.y, BALL_RADIUS_PX, 0, Math.PI * 2);
  ctx.fillStyle = "#e5e7eb";
  ctx.fill();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(level.ballSpawn.x, level.ballSpawn.y, BALL_RADIUS_PX + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ghost preview for placement
  if (hoverPos && activeTool !== "select") {
    ctx.globalAlpha = 0.4;
    if (activeTool === "wall") {
      ctx.fillStyle = "#374151";
      ctx.fillRect(hoverPos.x - 40, hoverPos.y - 5, 80, 10);
    } else if (activeTool === "bumper") {
      ctx.beginPath();
      ctx.arc(hoverPos.x, hoverPos.y, BUMPER_RADIUS_PX, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
    } else if (activeTool === "flipper") {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(hoverPos.x, hoverPos.y - FLIPPER_HEIGHT / 2);
      ctx.lineTo(hoverPos.x + FLIPPER_WIDTH, hoverPos.y - FLIPPER_TIP_HEIGHT / 2);
      ctx.lineTo(hoverPos.x + FLIPPER_WIDTH, hoverPos.y + FLIPPER_TIP_HEIGHT / 2);
      ctx.lineTo(hoverPos.x, hoverPos.y + FLIPPER_HEIGHT / 2);
      ctx.closePath();
      ctx.fill();
    } else if (activeTool === "sling") {
      ctx.fillStyle = "#f97316";
      ctx.fillRect(hoverPos.x - 45, hoverPos.y - 4, 90, 8);
    } else if (activeTool === "kicker") {
      ctx.beginPath();
      ctx.arc(hoverPos.x, hoverPos.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    } else if (activeTool === "laneGuide") {
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(hoverPos.x - 2, hoverPos.y - 25, 4, 50);
    } else if (activeTool === "ballSpawn") {
      ctx.beginPath();
      ctx.arc(hoverPos.x, hoverPos.y, BALL_RADIUS_PX, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function hitTest(
  level: LevelConfig,
  x: number,
  y: number
): string | null {
  // Check flippers
  for (const f of level.flippers) {
    const offsetX = f.isLeft ? FLIPPER_WIDTH / 2 : -FLIPPER_WIDTH / 2;
    const fcx = f.anchorX + offsetX;
    if (
      Math.abs(x - fcx) < FLIPPER_WIDTH / 2 &&
      Math.abs(y - f.anchorY) < FLIPPER_HEIGHT / 2
    ) {
      return f.id;
    }
  }

  // Check kickers
  for (const k of level.kickers ?? []) {
    const r = k.radius ?? 12;
    const dx = x - k.cx;
    const dy = y - k.cy;
    if (dx * dx + dy * dy < r * r) return k.id;
  }

  // Check bumpers
  for (const b of level.bumpers) {
    const r = b.radius ?? BUMPER_RADIUS_PX;
    const dx = x - b.cx;
    const dy = y - b.cy;
    if (dx * dx + dy * dy < r * r) return b.id;
  }

  // Check slings
  for (const s of level.slings ?? []) {
    if (Math.abs(x - s.cx) < 50 && Math.abs(y - s.cy) < 10) return s.id;
  }

  // Check lane guides
  for (const lg of level.laneGuides ?? []) {
    if (Math.abs(x - lg.cx) < lg.hw + 4 && Math.abs(y - lg.cy) < lg.hh + 4) return lg.id;
  }

  // Check walls
  for (const w of level.walls) {
    if (
      Math.abs(x - w.cx) < w.hw + 4 &&
      Math.abs(y - w.cy) < w.hh + 4
    ) {
      return w.id;
    }
  }

  return null;
}
