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

export interface LevelConfig {
  name: string;
  ballSpawn: { x: number; y: number };
  walls: WallConfig[];
  bumpers: BumperConfig[];
  flippers: FlipperConfig[];
}

export type ElementType = "wall" | "bumper" | "flipper";

export type LevelElement =
  | ({ type: "wall" } & WallConfig)
  | ({ type: "bumper" } & BumperConfig)
  | ({ type: "flipper" } & FlipperConfig);
