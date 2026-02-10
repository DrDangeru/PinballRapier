import { LevelConfig } from "./types";
import { TABLE_WIDTH, TABLE_HEIGHT, WALL_THICKNESS } from "../constants";

const w = TABLE_WIDTH;
const h = TABLE_HEIGHT;
const wt = WALL_THICKNESS;

export const defaultLevel: LevelConfig = {
  name: "Classic",
  ballSpawn: { x: w - 25, y: h - 120 },
  walls: [
    // Boundary walls
    { id: "wall-left", cx: wt / 2, cy: h / 2, hw: wt / 2, hh: h / 2 },
    { id: "wall-right", cx: w - wt / 2, cy: h / 2, hw: wt / 2, hh: h / 2 },
    { id: "wall-top", cx: w / 2, cy: wt / 2, hw: w / 2, hh: wt / 2 },
    // Bottom drain walls (gap for drain)
    { id: "wall-bl", cx: w * 0.18, cy: h - wt / 2, hw: w * 0.18, hh: wt / 2 },
    { id: "wall-br", cx: w * 0.82, cy: h - wt / 2, hw: w * 0.18, hh: wt / 2 },

    // Plunger lane (right side channel)
    { id: "plunger-wall", cx: w - 40, cy: h * 0.55, hw: 3, hh: h * 0.35 },
    // Plunger lane top curve guide
    { id: "plunger-top", cx: w - 30, cy: h * 0.15, hw: 20, hh: 4, rotation: 0.6 },

    // Flipper guide walls (angled inlanes)
    { id: "guide-l", cx: 45, cy: h - 110, hw: 45, hh: 4, rotation: -0.45 },
    { id: "guide-r", cx: w - 65, cy: h - 110, hw: 45, hh: 4, rotation: 0.45 },

    // Outlane walls
    { id: "outlane-l", cx: 25, cy: h - 55, hw: 3, hh: 30 },
    { id: "outlane-r", cx: w - 45, cy: h - 55, hw: 3, hh: 30 },

    // Upper arch
    { id: "arch-l", cx: 60, cy: h * 0.18, hw: 35, hh: 4, rotation: -0.7 },
    { id: "arch-r", cx: w - 80, cy: h * 0.18, hw: 35, hh: 4, rotation: 0.7 },

    // Drop target bank (row of thin walls)
    { id: "drop-1", cx: w * 0.3, cy: h * 0.42, hw: 15, hh: 3 },
    { id: "drop-2", cx: w * 0.5, cy: h * 0.42, hw: 15, hh: 3 },
    { id: "drop-3", cx: w * 0.7, cy: h * 0.42, hw: 15, hh: 3 },
  ],
  bumpers: [
    // Classic triangle bumper formation
    { id: "bump-1", cx: w * 0.35, cy: h * 0.22, radius: 22, restitution: 1.6 },
    { id: "bump-2", cx: w * 0.6, cy: h * 0.22, radius: 22, restitution: 1.6 },
    { id: "bump-3", cx: w * 0.47, cy: h * 0.32, radius: 18, restitution: 1.8 },
    // Lower bumpers
    { id: "bump-4", cx: w * 0.25, cy: h * 0.52, radius: 16, restitution: 1.4 },
    { id: "bump-5", cx: w * 0.7, cy: h * 0.52, radius: 16, restitution: 1.4 },
  ],
  flippers: [
    { id: "flip-l", anchorX: w * 0.28, anchorY: h - 55, isLeft: true },
    { id: "flip-r", anchorX: w * 0.68, anchorY: h - 55, isLeft: false },
  ],
  slings: [
    // Slingshots just above flippers — angled kickers
    { id: "sling-l", cx: 75, cy: h - 160, rotation: -0.5, isLeft: true },
    { id: "sling-r", cx: w - 95, cy: h - 160, rotation: 0.5, isLeft: false },
  ],
  kickers: [
    // Upper playfield kickers
    { id: "kick-1", cx: w * 0.15, cy: h * 0.35, radius: 10 },
    { id: "kick-2", cx: w * 0.85, cy: h * 0.35, radius: 10 },
  ],
  laneGuides: [
    // Upper lane dividers
    { id: "lane-1", cx: w * 0.3, cy: h * 0.1, hw: 2, hh: 25 },
    { id: "lane-2", cx: w * 0.45, cy: h * 0.1, hw: 2, hh: 25 },
    { id: "lane-3", cx: w * 0.6, cy: h * 0.1, hw: 2, hh: 25 },
    // Mid-field guide rails
    { id: "lane-4", cx: w * 0.15, cy: h * 0.6, hw: 2, hh: 30, rotation: -0.15 },
    { id: "lane-5", cx: w * 0.82, cy: h * 0.6, hw: 2, hh: 30, rotation: 0.15 },
  ],
  cardTargets: [
    { id: "card-1", cx: 55, cy: h * 0.42, label: "A♠" },
    { id: "card-2", cx: 55, cy: h * 0.48, label: "A♥" },
    { id: "card-3", cx: 55, cy: h * 0.54, label: "A♦" },
    { id: "card-4", cx: 55, cy: h * 0.60, label: "A♣" },
  ],
  iconTargets: [
    { id: "icon-1", cx: w - 55, cy: h * 0.45, label: "🃏" },
    { id: "icon-2", cx: w - 55, cy: h * 0.55, label: "🃏" },
  ],
};
