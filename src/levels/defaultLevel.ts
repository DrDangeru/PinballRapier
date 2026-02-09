import { LevelConfig } from "./types";
import { TABLE_WIDTH, TABLE_HEIGHT, WALL_THICKNESS } from "../constants";

const w = TABLE_WIDTH;
const h = TABLE_HEIGHT;
const wt = WALL_THICKNESS;

export const defaultLevel: LevelConfig = {
  name: "Classic",
  ballSpawn: { x: w / 2, y: 80 },
  walls: [
    // Boundary walls
    { id: "wall-left", cx: wt / 2, cy: h / 2, hw: wt / 2, hh: h / 2 },
    { id: "wall-right", cx: w - wt / 2, cy: h / 2, hw: wt / 2, hh: h / 2 },
    { id: "wall-top", cx: w / 2, cy: wt / 2, hw: w / 2, hh: wt / 2 },
    // Bottom drain walls
    { id: "wall-bl", cx: w * 0.2, cy: h - wt / 2, hw: w * 0.2, hh: wt / 2 },
    { id: "wall-br", cx: w * 0.8, cy: h - wt / 2, hw: w * 0.2, hh: wt / 2 },
    // Angled guides
    { id: "guide-l", cx: 50, cy: h - 100, hw: 40, hh: 4, rotation: -0.4 },
    { id: "guide-r", cx: w - 50, cy: h - 100, hw: 40, hh: 4, rotation: 0.4 },
  ],
  bumpers: [
    { id: "bump-1", cx: w * 0.35, cy: h * 0.25 },
    { id: "bump-2", cx: w * 0.65, cy: h * 0.25 },
    { id: "bump-3", cx: w * 0.5, cy: h * 0.38 },
    { id: "bump-4", cx: w * 0.3, cy: h * 0.5 },
    { id: "bump-5", cx: w * 0.7, cy: h * 0.5 },
  ],
  flippers: [
    { id: "flip-l", anchorX: w * 0.3, anchorY: h - 60, isLeft: true },
    { id: "flip-r", anchorX: w * 0.7, anchorY: h - 60, isLeft: false },
  ],
};
