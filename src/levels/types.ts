export interface WallConfig {
  id: string;
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  rotation?: number;
}

export interface BumperConfig {
  id: string;
  cx: number;
  cy: number;
  radius?: number;
  restitution?: number;
  points?: number;
}

export interface FlipperConfig {
  id: string;
  anchorX: number;
  anchorY: number;
  isLeft: boolean;
}

export interface SlingConfig {
  id: string;
  cx: number;
  cy: number;
  rotation?: number;
  isLeft: boolean;
}

export interface KickerConfig {
  id: string;
  cx: number;
  cy: number;
  radius?: number;
}

export interface LaneGuideConfig {
  id: string;
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  rotation?: number;
}

export interface CardTargetConfig {
  id: string;
  cx: number;
  cy: number;
  label: string; // e.g. "A♠", "A♥", "A♦", "A♣"
  rotation?: number;
}

export interface IconTargetConfig {
  id: string;
  cx: number;
  cy: number;
  label: string; // e.g. "Joker♠", "Joker♥", "Joker♦", "Joker♣"
  rotation?: number;
}

export interface LevelConfig {
  name: string;
  ballSpawn: { x: number; y: number };
  walls: WallConfig[];
  bumpers: BumperConfig[];
  flippers: FlipperConfig[];
  slings?: SlingConfig[];
  kickers?: KickerConfig[];
  laneGuides?: LaneGuideConfig[];
  cardTargets?: CardTargetConfig[];
  iconTargets?: IconTargetConfig[];
}

export type ElementType = "wall" | "bumper" | "flipper" | "sling" | "kicker" | "laneGuide";

export type LevelElement =
  | ({ type: "wall" } & WallConfig)
  | ({ type: "bumper" } & BumperConfig)
  | ({ type: "flipper" } & FlipperConfig)
  | ({ type: "sling" } & SlingConfig)
  | ({ type: "kicker" } & KickerConfig)
  | ({ type: "laneGuide" } & LaneGuideConfig);
