// Canvas / table dimensions (in pixels)
export const TABLE_WIDTH = 400;
export const TABLE_HEIGHT = 700;

// Physics scale: pixels per meter
export const SCALE = 50;

// Pixel → physics
export const px = (v: number) => v / SCALE;
// Physics → pixel
export const toScreen = (v: number) => v * SCALE;

// Ball (real pinball ~27mm on 42" table, scaled to 700px)
export const BALL_RADIUS_PX = 14;
export const BALL_RADIUS = px(BALL_RADIUS_PX);

// Flipper (tapered: wide at pivot, narrow at tip)
export const FLIPPER_WIDTH = 80;
export const FLIPPER_HEIGHT = 16;
export const FLIPPER_TIP_HEIGHT = 8;
export const FLIPPER_SPEED = 15;

// Plunger / launcher
export const PLUNGER_FORCE = 300;

// Bumper
export const BUMPER_RADIUS_PX = 20;
export const BUMPER_RESTITUTION = 1.5;

// Walls thickness
export const WALL_THICKNESS = 10;
