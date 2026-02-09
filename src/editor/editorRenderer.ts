import { LevelConfig } from "../levels/types";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BUMPER_RADIUS_PX,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
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

  // Flippers
  for (const flipper of level.flippers) {
    const isSelected = flipper.id === selectedId;
    ctx.save();
    ctx.translate(flipper.anchorX, flipper.anchorY);
    ctx.fillStyle = isSelected ? "#60a5fa" : "#3b82f6";
    ctx.beginPath();
    const offsetX = flipper.isLeft ? 0 : -FLIPPER_WIDTH;
    ctx.roundRect(
      offsetX,
      -FLIPPER_HEIGHT / 2,
      FLIPPER_WIDTH,
      FLIPPER_HEIGHT,
      FLIPPER_HEIGHT / 2
    );
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
      ctx.roundRect(hoverPos.x, hoverPos.y - FLIPPER_HEIGHT / 2, FLIPPER_WIDTH, FLIPPER_HEIGHT, FLIPPER_HEIGHT / 2);
      ctx.fill();
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

  // Check bumpers
  for (const b of level.bumpers) {
    const r = b.radius ?? BUMPER_RADIUS_PX;
    const dx = x - b.cx;
    const dy = y - b.cy;
    if (dx * dx + dy * dy < r * r) return b.id;
  }

  // Check walls
  for (const w of level.walls) {
    // Simple AABB (ignoring rotation for hit test simplicity)
    if (
      Math.abs(x - w.cx) < w.hw + 4 &&
      Math.abs(y - w.cy) < w.hh + 4
    ) {
      return w.id;
    }
  }

  return null;
}
