import RAPIER from "@dimforge/rapier2d-compat";
import { LevelConfig } from "./types";
import {
  BALL_RADIUS,
  BUMPER_RADIUS_PX,
  BUMPER_RESTITUTION,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  px,
} from "../constants";
import { GameBodies } from "../game/setupTable";

function addWall(
  world: RAPIER.World,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  rotation = 0
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(px(cx), px(cy))
    .setRotation(rotation);
  const body = world.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.cuboid(px(hw), px(hh)).setRestitution(0.3);
  world.createCollider(colliderDesc, body);
  return body;
}

function addBumper(
  world: RAPIER.World,
  cx: number,
  cy: number,
  radius = BUMPER_RADIUS_PX,
  restitution = BUMPER_RESTITUTION
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(px(cx), px(cy));
  const body = world.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.ball(px(radius)).setRestitution(restitution);
  world.createCollider(colliderDesc, body);
  return body;
}

function addFlipper(
  world: RAPIER.World,
  anchorX: number,
  anchorY: number,
  isLeft: boolean
) {
  const anchorDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(px(anchorX), px(anchorY));
  const anchor = world.createRigidBody(anchorDesc);

  const offsetX = isLeft ? px(FLIPPER_WIDTH / 2) : px(-FLIPPER_WIDTH / 2);
  const flipperDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(px(anchorX) + offsetX, px(anchorY))
    .setAngularDamping(2.0);
  const flipper = world.createRigidBody(flipperDesc);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    px(FLIPPER_WIDTH / 2),
    px(FLIPPER_HEIGHT / 2)
  )
    .setDensity(5.0)
    .setRestitution(0.2);
  world.createCollider(colliderDesc, flipper);

  const jointParams = RAPIER.JointData.revolute(
    new RAPIER.Vector2(0.0, 0.0),
    new RAPIER.Vector2(-offsetX, 0.0)
  );

  const joint = world.createImpulseJoint(
    jointParams, anchor, flipper, true
  ) as RAPIER.RevoluteImpulseJoint;

  return { flipper, joint };
}

export function buildLevel(world: RAPIER.World, config: LevelConfig): GameBodies {
  // Walls
  for (const w of config.walls) {
    addWall(world, w.cx, w.cy, w.hw, w.hh, w.rotation ?? 0);
  }

  // Bumpers
  const bumpers = config.bumpers.map((b) =>
    addBumper(world, b.cx, b.cy, b.radius, b.restitution)
  );

  // Flippers
  let leftFlipper: RAPIER.RigidBody | null = null;
  let rightFlipper: RAPIER.RigidBody | null = null;
  let leftFlipperJoint: RAPIER.RevoluteImpulseJoint | null = null;
  let rightFlipperJoint: RAPIER.RevoluteImpulseJoint | null = null;

  for (const f of config.flippers) {
    const result = addFlipper(world, f.anchorX, f.anchorY, f.isLeft);
    if (f.isLeft) {
      leftFlipper = result.flipper;
      leftFlipperJoint = result.joint;
    } else {
      rightFlipper = result.flipper;
      rightFlipperJoint = result.joint;
    }
  }

  // Ball
  const ballDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(px(config.ballSpawn.x), px(config.ballSpawn.y))
    .setCcdEnabled(true);
  const ball = world.createRigidBody(ballDesc);
  const ballCollider = RAPIER.ColliderDesc.ball(BALL_RADIUS)
    .setRestitution(0.5)
    .setDensity(1.0)
    .setFriction(0.3);
  world.createCollider(ballCollider, ball);

  return {
    ball,
    leftFlipper: leftFlipper!,
    rightFlipper: rightFlipper!,
    leftFlipperJoint: leftFlipperJoint!,
    rightFlipperJoint: rightFlipperJoint!,
    bumpers,
  };
}
