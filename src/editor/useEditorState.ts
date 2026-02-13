import { useState, useCallback, useEffect } from "react";
import { LevelConfig, WallConfig, BumperConfig, FlipperConfig, SlingConfig, KickerConfig,
   LaneGuideConfig, TrampolineConfig, ElementType } from "../levels/types";
import { TABLE_WIDTH, WALL_THICKNESS, BUMPER_RADIUS_PX } from "../constants";
import { listLevels, loadLevel as fetchLevelEntry, saveLevel, LevelEntry } from "../levels/levelLoader";

let nextId = 100;
const uid = (prefix: string) => `${prefix}-${nextId++}`;

const emptyLevel: LevelConfig = {
  name: "Untitled",
  ballSpawn: { x: TABLE_WIDTH / 2, y: 80 },
  walls: [],
  bumpers: [],
  flippers: [],
  slings: [],
  kickers: [],
  laneGuides: [],
};

export function useEditorState() {
  const [level, setLevel] = useState<LevelConfig>(emptyLevel);
  const [currentFilename, setCurrentFilename] = useState<string>("Classic-1.json");
  const [levelEntries, setLevelEntries] = useState<LevelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load level list and default level on mount
  useEffect(() => {
    (async () => {
      const entries = await listLevels();
      setLevelEntries(entries);
      const first = entries[0];
      if (first) {
        setCurrentFilename(first.filename);
        const config = await fetchLevelEntry(first);
        setLevel(structuredClone(config));
      }
      setLoading(false);
    })();
  }, []);

  const refreshEntries = useCallback(async () => {
    setLevelEntries(await listLevels());
  }, []);

  const loadLevelEntry = useCallback(async (entry: LevelEntry) => {
    const config = await fetchLevelEntry(entry);
    setLevel(structuredClone(config));
    setCurrentFilename(entry.filename);
    setSelectedId(null);
  }, []);

  const saveCurrent = useCallback(async () => {
    if (!level.name.trim()) return;
    await saveLevel(level, currentFilename);
  }, [level, currentFilename]);

  const reloadCurrent = useCallback(async () => {
    const entries = await listLevels();
    const entry = entries.find((e) => e.filename === currentFilename);
    if (entry) {
      const config = await fetchLevelEntry(entry);
      setLevel(structuredClone(config));
      setSelectedId(null);
    }
  }, [currentFilename]);
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

  const addTrampoline = useCallback((cx: number, cy: number) => {
    const t: TrampolineConfig = { id: uid("tramp"), cx, cy, hw: 40, hh: 6, restitution: 3.0 };
    setLevel((prev) => ({ ...prev, trampolines: [...(prev.trampolines ?? []), t] }));
    setSelectedId(t.id);
  }, []);

  const setBallSpawn = useCallback((x: number, y: number) => {
    setLevel((prev) => ({ ...prev, ballSpawn: { x, y } }));
  }, []);

  const moveElement = useCallback((id: string, cx: number, cy: number, relative = false) => {
    setLevel((prev) => {
      const mv = (ox: number, oy: number) => relative ? { cx: ox + cx, cy: oy + cy } : { cx, cy };
      const mvF = (ox: number, oy: number) => relative ? { anchorX: ox + cx, anchorY: oy + cy } : { anchorX: cx, anchorY: cy };
      const walls = prev.walls.map((w) => (w.id === id ? { ...w, ...mv(w.cx, w.cy) } : w));
      const bumpers = prev.bumpers.map((b) => (b.id === id ? { ...b, ...mv(b.cx, b.cy) } : b));
      const flippers = prev.flippers.map((f) =>
        f.id === id ? { ...f, ...mvF(f.anchorX, f.anchorY) } : f
      );
      const slings = (prev.slings ?? []).map((s) => (s.id === id ? { ...s, ...mv(s.cx, s.cy) } : s));
      const kickers = (prev.kickers ?? []).map((k) => (k.id === id ? { ...k, ...mv(k.cx, k.cy) } : k));
      const laneGuides = (prev.laneGuides ?? []).map((lg) => (lg.id === id ? { ...lg, ...mv(lg.cx, lg.cy) } : lg));
      const cardTargets = (prev.cardTargets ?? []).map((ct) => (ct.id === id ? { ...ct, ...mv(ct.cx, ct.cy) } : ct));
      const iconTargets = (prev.iconTargets ?? []).map((it) => (it.id === id ? { ...it, ...mv(it.cx, it.cy) } : it));
      const trampolines = (prev.trampolines ?? []).map((t) => (t.id === id ? { ...t, ...mv(t.cx, t.cy) } : t));
      return { ...prev, walls, bumpers, flippers, slings, kickers, laneGuides, cardTargets, iconTargets, trampolines };
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
      cardTargets: (prev.cardTargets ?? []).filter((ct) => ct.id !== id),
      iconTargets: (prev.iconTargets ?? []).filter((it) => it.id !== id),
      trampolines: (prev.trampolines ?? []).filter((t) => t.id !== id),
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

  const rotateElement = useCallback((id: string, delta: number) => {
    setLevel((prev) => {
      const rot = (r?: number) => parseFloat(((r ?? 0) + delta).toFixed(3));
      return {
        ...prev,
        walls: prev.walls.map((w) => (w.id === id ? { ...w, rotation: rot(w.rotation) } : w)),
        slings: (prev.slings ?? []).map((s) => (s.id === id ? { ...s, rotation: rot(s.rotation) } : s)),
        laneGuides: (prev.laneGuides ?? []).map((lg) => (lg.id === id ? { ...lg, rotation: rot(lg.rotation) } : lg)),
        cardTargets: (prev.cardTargets ?? []).map((ct) => (ct.id === id ? { ...ct, rotation: rot(ct.rotation) } : ct)),
        iconTargets: (prev.iconTargets ?? []).map((it) => (it.id === id ? { ...it, rotation: rot(it.rotation) } : it)),
        trampolines: (prev.trampolines ?? []).map((t) => (t.id === id ? { ...t, rotation: rot(t.rotation) } : t)),
      };
    });
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
      trampolines: [],
    });
    setSelectedId(null);
  }, []);

  return {
    level,
    levelEntries,
    loading,
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
    addTrampoline,
    setBallSpawn,
    moveElement,
    deleteElement,
    updateWall,
    updateBumper,
    rotateElement,
    setLevelName,
    loadLevel,
    loadLevelEntry,
    saveCurrent,
    reloadCurrent,
    refreshEntries,
    clearLevel,
  };
}
