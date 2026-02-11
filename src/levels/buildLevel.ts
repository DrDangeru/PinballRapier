import RAPIER from "@dimforge/rapier2d-compat";
import { LevelConfig } from "./types";
import {
  BALL_RADIUS,
  BUMPER_RADIUS_PX,
  BUMPER_RESTITUTION,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  FLIPPER_TIP_HEIGHT,
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
  const colliderDesc = RAPIER.ColliderDesc.cuboid(px(hw), px(hh)).setRestitution(0.3).setFriction(0.0);
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

  // Tapered flipper: wide base near pivot, narrow tip
  const baseHW = px(FLIPPER_WIDTH * 0.3);
  const baseHH = px(FLIPPER_HEIGHT / 2);
  const tipHW = px(FLIPPER_WIDTH * 0.25);
  const tipHH = px(FLIPPER_TIP_HEIGHT / 2);
  const dir = isLeft ? 1 : -1;

  // Base collider (near pivot)
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(baseHW, baseHH)
      .setTranslation(px(-dir * FLIPPER_WIDTH * 0.2), 0)
      .setDensity(5.0)
      .setRestitution(0.2),
    flipper
  );
  // Tip collider (far from pivot)
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(tipHW, tipHH)
      .setTranslation(px(dir * FLIPPER_WIDTH * 0.2), 0)
      .setDensity(3.0)
      .setRestitution(0.3),
    flipper
  );

  const jointParams = RAPIER.JointData.revolute(
    new RAPIER.Vector2(0.0, 0.0),
    new RAPIER.Vector2(-offsetX, 0.0)
  );

  const joint = world.createImpulseJoint(
    jointParams, anchor, flipper, true
  ) as RAPIER.RevoluteImpulseJoint;

  return { flipper, joint };
}

function addSling(
  world: RAPIER.World,
  cx: number,
  cy: number,
  rotation: number,
  _isLeft: boolean
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(px(cx), px(cy))
    .setRotation(rotation);
  const body = world.createRigidBody(bodyDesc);
  // Slingshot: angled wall with high restitution to kick the ball
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(45), px(4))
      .setRestitution(1.8)
      .setFriction(0.0),
    body
  );
  return body;
}

function addKicker(
  world: RAPIER.World,
  cx: number,
  cy: number,
  radius = 12
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(px(cx), px(cy));
  const body = world.createRigidBody(bodyDesc);
  // Kicker: small circle with very high restitution
  world.createCollider(
    RAPIER.ColliderDesc.ball(px(radius))
      .setRestitution(2.5),
    body
  );
  return body;
}

function addLaneGuide(
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
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(hw), px(hh))
      .setRestitution(0.1)
      .setFriction(0.1),
    body
  );
  return body;
}

function addCardTarget(
  world: RAPIER.World,
  cx: number,
  cy: number,
  rotation = 0
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(px(cx), px(cy))
    .setRotation(rotation);
  const body = world.createRigidBody(bodyDesc);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(34), px(24))
      .setRestitution(0.6),
    body
  );
  return body;
}

function addIconTarget(
  world: RAPIER.World,
  cx: number,
  cy: number,
  rotation = 0
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(px(cx), px(cy))
    .setRotation(rotation);
  const body = world.createRigidBody(bodyDesc);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(34), px(24))
      .setRestitution(0.6),
    body
  );
  return body;
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

  // Slingshots
  const slings = (config.slings ?? []).map((s) =>
    addSling(world, s.cx, s.cy, s.rotation ?? 0, s.isLeft)
  );

  // Kickers
  const kickers = (config.kickers ?? []).map((k) =>
    addKicker(world, k.cx, k.cy, k.radius)
  );

  // Lane guides
  const laneGuides = (config.laneGuides ?? []).map((lg) =>
    addLaneGuide(world, lg.cx, lg.cy, lg.hw, lg.hh, lg.rotation ?? 0)
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
    .setCcdEnabled(true)
    .setCanSleep(false)
    .setLinearDamping(0.0);
  const ball = world.createRigidBody(ballDesc);
  const ballCollider = RAPIER.ColliderDesc.ball(BALL_RADIUS)
    .setRestitution(0.5)
    .setDensity(1.0)
    .setFriction(0.03);
  world.createCollider(ballCollider, ball);

  // Card targets
  const cardTargets = (config.cardTargets ?? []).map((ct) =>
    addCardTarget(world, ct.cx, ct.cy, ct.rotation ?? 0)
  );

  // Icon targets
  const iconTargets = (config.iconTargets ?? []).map((it) =>
    addIconTarget(world, it.cx, it.cy, it.rotation ?? 0)
  );

  return {
    ball,
    leftFlipper: leftFlipper!,
    rightFlipper: rightFlipper!,
    leftFlipperJoint: leftFlipperJoint!,
    rightFlipperJoint: rightFlipperJoint!,
    bumpers,
    slings,
    kickers,
    laneGuides,
    cardTargets,
    cardHitState: cardTargets.map(() => false),
    jackpotTriggered: false,
    jackpotTimer: 0,
    iconTargets,
    iconHitState: iconTargets.map(() => false),
    
  };
}
