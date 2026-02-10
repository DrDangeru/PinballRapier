import { useState, useCallback } from "react";
import { LevelConfig, WallConfig, BumperConfig, FlipperConfig, SlingConfig, KickerConfig, LaneGuideConfig, ElementType } from "../levels/types";
import { TABLE_WIDTH, WALL_THICKNESS, BUMPER_RADIUS_PX } from "../constants";
import { defaultLevel } from "../levels/defaultLevel";

let nextId = 100;
const uid = (prefix: string) => `${prefix}-${nextId++}`;

export function useEditorState() {
  const [level, setLevel] = useState<LevelConfig>(() => structuredClone(defaultLevel));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ElementType | "select" | "ballSpawn">("select");

  const addWall = useCallback((cx: number, cy: number) => {
    const wall: WallConfig = {
      id: uid("wall"),
      cx,
      cy,
      hw: 40,
      hh: WALL_THICKNESS / 2,
    };
    setLevel((prev) => ({ ...prev, walls: [...prev.walls, wall] }));
    setSelectedId(wall.id);
  }, []);

  const addBumper = useCallback((cx: number, cy: number) => {
    const bumper: BumperConfig = {
      id: uid("bump"),
      cx,
      cy,
      radius: BUMPER_RADIUS_PX,
    };
    setLevel((prev) => ({ ...prev, bumpers: [...prev.bumpers, bumper] }));
    setSelectedId(bumper.id);
  }, []);

  const addFlipper = useCallback((cx: number, cy: number, isLeft: boolean) => {
    const flipper: FlipperConfig = {
      id: uid("flip"),
      anchorX: cx,
      anchorY: cy,
      isLeft,
    };
    setLevel((prev) => ({ ...prev, flippers: [...prev.flippers, flipper] }));
    setSelectedId(flipper.id);
  }, []);

  const addSling = useCallback((cx: number, cy: number, isLeft: boolean) => {
    const sling: SlingConfig = { id: uid("sling"), cx, cy, rotation: isLeft ? -0.5 : 0.5, isLeft };
    setLevel((prev) => ({ ...prev, slings: [...(prev.slings ?? []), sling] }));
    setSelectedId(sling.id);
  }, []);

  const addKicker = useCallback((cx: number, cy: number) => {
    const kicker: KickerConfig = { id: uid("kick"), cx, cy, radius: 12 };
    setLevel((prev) => ({ ...prev, kickers: [...(prev.kickers ?? []), kicker] }));
    setSelectedId(kicker.id);
  }, []);

  const addLaneGuide = useCallback((cx: number, cy: number) => {
    const lg: LaneGuideConfig = { id: uid("lane"), cx, cy, hw: 2, hh: 25 };
    setLevel((prev) => ({ ...prev, laneGuides: [...(prev.laneGuides ?? []), lg] }));
    setSelectedId(lg.id);
  }, []);

  const setBallSpawn = useCallback((x: number, y: number) => {
    setLevel((prev) => ({ ...prev, ballSpawn: { x, y } }));
  }, []);

  const moveElement = useCallback((id: string, cx: number, cy: number) => {
    setLevel((prev) => {
      const walls = prev.walls.map((w) => (w.id === id ? { ...w, cx, cy } : w));
      const bumpers = prev.bumpers.map((b) => (b.id === id ? { ...b, cx, cy } : b));
      const flippers = prev.flippers.map((f) =>
        f.id === id ? { ...f, anchorX: cx, anchorY: cy } : f
      );
      const slings = (prev.slings ?? []).map((s) => (s.id === id ? { ...s, cx, cy } : s));
      const kickers = (prev.kickers ?? []).map((k) => (k.id === id ? { ...k, cx, cy } : k));
      const laneGuides = (prev.laneGuides ?? []).map((lg) => (lg.id === id ? { ...lg, cx, cy } : lg));
      return { ...prev, walls, bumpers, flippers, slings, kickers, laneGuides };
    });
  }, []);

  const deleteElement = useCallback((id: string) => {
    setLevel((prev) => ({
      ...prev,
      walls: prev.walls.filter((w) => w.id !== id),
      bumpers: prev.bumpers.filter((b) => b.id !== id),
      flippers: prev.flippers.filter((f) => f.id !== id),
      slings: (prev.slings ?? []).filter((s) => s.id !== id),
      kickers: (prev.kickers ?? []).filter((k) => k.id !== id),
      laneGuides: (prev.laneGuides ?? []).filter((lg) => lg.id !== id),
    }));
    setSelectedId(null);
  }, []);

  const updateWall = useCallback((id: string, updates: Partial<WallConfig>) => {
    setLevel((prev) => ({
      ...prev,
      walls: prev.walls.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  }, []);

  const updateBumper = useCallback((id: string, updates: Partial<BumperConfig>) => {
    setLevel((prev) => ({
      ...prev,
      bumpers: prev.bumpers.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const setLevelName = useCallback((name: string) => {
    setLevel((prev) => ({ ...prev, name }));
  }, []);

  const loadLevel = useCallback((config: LevelConfig) => {
    setLevel(structuredClone(config));
    setSelectedId(null);
  }, []);

  const clearLevel = useCallback(() => {
    setLevel({
      name: "Untitled",
      ballSpawn: { x: TABLE_WIDTH / 2, y: 80 },
      walls: [],
      bumpers: [],
      flippers: [],
      slings: [],
      kickers: [],
      laneGuides: [],
    });
    setSelectedId(null);
  }, []);

  return {
    level,
    selectedId,
    setSelectedId,
    activeTool,
    setActiveTool,
    addWall,
    addBumper,
    addFlipper,
    addSling,
    addKicker,
    addLaneGuide,
    setBallSpawn,
    moveElement,
    deleteElement,
    updateWall,
    updateBumper,
    setLevelName,
    loadLevel,
    clearLevel,
  };
}
