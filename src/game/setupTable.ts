import RAPIER from "@dimforge/rapier2d-compat";
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_RADIUS,
  BUMPER_RADIUS_PX,
  BUMPER_RESTITUTION,
  WALL_THICKNESS,
  FLIPPER_WIDTH,
  FLIPPER_HEIGHT,
  px,
} from "../constants";

export interface GameBodies {
  ball: RAPIER.RigidBody;
  leftFlipper: RAPIER.RigidBody;
  rightFlipper: RAPIER.RigidBody;
  leftFlipperJoint: RAPIER.RevoluteImpulseJoint;
  rightFlipperJoint: RAPIER.RevoluteImpulseJoint;
  bumpers: RAPIER.RigidBody[];
  slings: RAPIER.RigidBody[];
  kickers: RAPIER.RigidBody[];
  laneGuides: RAPIER.RigidBody[];
  cardTargets: RAPIER.RigidBody[];
  cardHitState: boolean[];
  iconTargets: RAPIER.RigidBody[];
  iconHitState: boolean[];
  jackpotTriggered: boolean;
  jackpotTimer: number;
  trampolines: RAPIER.RigidBody[];
}

function addWall(
  world: RAPIER.World,
  cx: number,
  cy: number,
  hw: number,
  hh: number
) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    px(cx),
    px(cy)
  );
  const body = world.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.cuboid(px(hw), px(hh))
    .setRestitution(0.3);
  world.createCollider(colliderDesc, body);
  return body;
}

function addBumper(world: RAPIER.World, cx: number, cy: number) {
  const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    px(cx),
    px(cy)
  );
  const body = world.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.ball(px(BUMPER_RADIUS_PX))
    .setRestitution(BUMPER_RESTITUTION);
  world.createCollider(colliderDesc, body);
  return body;
}

function addFlipper(
  world: RAPIER.World,
  anchorX: number,
  anchorY: number,
  isLeft: boolean
) {
  // Anchor (fixed body)
  const anchorDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    px(anchorX),
    px(anchorY)
  );
  const anchor = world.createRigidBody(anchorDesc);

  // Flipper (dynamic body)
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

  // Revolute joint
  const jointParams = RAPIER.JointData.revolute(
    new RAPIER.Vector2(0.0, 0.0),
    new RAPIER.Vector2(-offsetX, 0.0)
  );

  const minAngle = isLeft ? -0.3 : -0.8;
  const maxAngle = isLeft ? 0.8 : 0.3;
  jointParams.limitsEnabled = true;
  jointParams.limits = [minAngle, maxAngle];

  const joint = world.createImpulseJoint(
    jointParams, anchor, flipper, true
  ) as RAPIER.RevoluteImpulseJoint;

  return { flipper, joint };
}

export function setupTable(world: RAPIER.World): GameBodies {
  const w = TABLE_WIDTH;
  const h = TABLE_HEIGHT;
  const wt = WALL_THICKNESS;

  // Walls: left, right, top, bottom
  addWall(world, wt / 2, h / 2, wt / 2, h / 2);           // left
  addWall(world, w - wt / 2, h / 2, wt / 2, h / 2);       // right
  addWall(world, w / 2, wt / 2, w / 2, wt / 2);            // top

  // Bottom drain walls (gap in the middle for drain)
  addWall(world, w * 0.2, h - wt / 2, w * 0.2, wt / 2);   // bottom-left
  addWall(world, w * 0.8, h - wt / 2, w * 0.2, wt / 2);   // bottom-right

  // Angled guide walls near flippers
  const guideBody1 = RAPIER.RigidBodyDesc.fixed().setTranslation(
    px(50), px(h - 100)
  ).setRotation(-0.4);
  const gb1 = world.createRigidBody(guideBody1);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(40), px(4)).setRestitution(0.3),
    gb1
  );

  const guideBody2 = RAPIER.RigidBodyDesc.fixed().setTranslation(
    px(w - 50), px(h - 100)
  ).setRotation(0.4);
  const gb2 = world.createRigidBody(guideBody2);
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(px(40), px(4)).setRestitution(0.3),
    gb2
  );

  // Bumpers
  const bumpers = [
    addBumper(world, w * 0.35, h * 0.25),
    addBumper(world, w * 0.65, h * 0.25),
    addBumper(world, w * 0.5, h * 0.38),
    addBumper(world, w * 0.3, h * 0.5),
    addBumper(world, w * 0.7, h * 0.5),
  ];

  // Flippers
  const flipperY = h - 60;
  const left = addFlipper(world, w * 0.3, flipperY, true);
  const right = addFlipper(world, w * 0.7, flipperY, false);

  // Ball
  const ballDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(px(w / 2), px(80))
    .setCcdEnabled(true);
  const ball = world.createRigidBody(ballDesc);
  const ballCollider = RAPIER.ColliderDesc.ball(BALL_RADIUS)
    .setRestitution(0.5)
    .setDensity(1.0)
    .setFriction(0.3);
  world.createCollider(ballCollider, ball);

  return {
    ball,
    leftFlipper: left.flipper,
    rightFlipper: right.flipper,
    leftFlipperJoint: left.joint,
    rightFlipperJoint: right.joint,
    bumpers,
    slings: [],
    kickers: [],
    laneGuides: [],
    cardTargets: [],
    cardHitState: [],
    jackpotTriggered: false,
    jackpotTimer: 0,
    iconTargets: [],
    iconHitState: [],
    trampolines: [],
    
  };
}

export function resetBall(ball: RAPIER.RigidBody, tableWidth: number) {
  ball.setTranslation(new RAPIER.Vector2(px(tableWidth / 2), px(80)), true);
  ball.setLinvel(new RAPIER.Vector2(0, 0), true);
  ball.setAngvel(0, true);
}
