// Canvas / table dimensions (in pixels)
export const TABLE_WIDTH = 400;
export const TABLE_HEIGHT = 700;

// Physics scale: pixels per meter
export const SCALE = 50;

// Pixel → physics
export const px = (v: number) => v / SCALE;
// Physics → pixel
export const toScreen = (v: number) => v * SCALE;

// Ball
export const BALL_RADIUS_PX = 10;
export const BALL_RADIUS = px(BALL_RADIUS_PX);

// Flipper
export const FLIPPER_WIDTH = 70;
export const FLIPPER_HEIGHT = 14;
export const FLIPPER_SPEED = 15;

// Plunger / launcher
export const PLUNGER_FORCE = 300;

// Bumper
export const BUMPER_RADIUS_PX = 20;
export const BUMPER_RESTITUTION = 1.5;

// Walls thickness
export const WALL_THICKNESS = 10;
