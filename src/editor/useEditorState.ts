import { useState, useCallback } from "react";
import { LevelConfig, WallConfig, BumperConfig, FlipperConfig, ElementType } from "../levels/types";
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
      return { ...prev, walls, bumpers, flippers };
    });
  }, []);

  const deleteElement = useCallback((id: string) => {
    setLevel((prev) => ({
      ...prev,
      walls: prev.walls.filter((w) => w.id !== id),
      bumpers: prev.bumpers.filter((b) => b.id !== id),
      flippers: prev.flippers.filter((f) => f.id !== id),
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
