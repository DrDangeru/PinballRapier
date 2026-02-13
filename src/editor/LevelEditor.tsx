import { useRef, useEffect, useCallback, useState } from "react";
import { TABLE_WIDTH, TABLE_HEIGHT } from "../constants";
import { useEditorState } from "./useEditorState";
import { renderEditor, hitTest } from "./editorRenderer";
import PropertiesPanel from "./PropertiesPanel";
import SavedLevelsPanel from "./SavedLevelsPanel";
import { useToast } from "./useToast";
import { LevelConfig, ElementType } from "../levels/types";
import { LevelEntry } from "../levels/levelLoader";

interface Props {
  onPlay: (level: LevelConfig) => void;
}

const tools: { key: ElementType | "select" | "ballSpawn"; label: string; icon: string }[] = [
  { key: "select", label: "Select", icon: "↖" },
  { key: "wall", label: "Wall", icon: "▬" },
  { key: "bumper", label: "Bumper", icon: "●" },
  { key: "flipper", label: "Flipper", icon: "⏤" },
  { key: "sling", label: "Slingshot", icon: "⟋" },
  { key: "kicker", label: "Kicker", icon: "◉" },
  { key: "laneGuide", label: "Lane Guide", icon: "│" },
  { key: "trampoline", label: "Trampoline", icon: "≡" },
  { key: "ballSpawn", label: "Ball Spawn", icon: "◎" },
];

export default function LevelEditor({ onPlay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
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
    levelEntries,
    saveCurrent,
    reloadCurrent,
    clearLevel,
  } = useEditorState();

  const { toast, show: showToast } = useToast();

  const handleSave = useCallback(async () => {
    showToast(`Saving ${level.name}...`, "info");
    await saveCurrent();
    showToast(`Saved "${level.name}"`, "success");
  }, [saveCurrent, level.name, showToast]);

  const handleLoad = useCallback(async (entry: LevelEntry) => {
    showToast(`Loading ${entry.name}...`, "info");
    await loadLevelEntry(entry);
    showToast(`Loaded "${entry.name}"`, "success");
  }, [loadLevelEntry, showToast]);

  const handleReload = useCallback(async () => {
    showToast("Reloading from file...", "info");
    await reloadCurrent();
    showToast(`Reloaded "${level.name}"`, "success");
  }, [reloadCurrent, level.name, showToast]);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [flipperSide, setFlipperSide] = useState(true); // true = left

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const draw = () => {
      renderEditor(ctx, level, selectedId, hoverPos, activeTool);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [level, selectedId, hoverPos, activeTool]);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasPos(e);

      if (activeTool === "select") {
        const id = hitTest(level, pos.x, pos.y);
        setSelectedId(id);
        if (id) {
          // Find element center for drag offset
          const wall = level.walls.find((w) => w.id === id);
          const bumper = level.bumpers.find((b) => b.id === id);
          const flipper = level.flippers.find((f) => f.id === id);
          const sling = (level.slings ?? []).find((s) => s.id === id);
          const kicker = (level.kickers ?? []).find((k) => k.id === id);
          const lg = (level.laneGuides ?? []).find((l) => l.id === id);
          const ct = (level.cardTargets ?? []).find((c) => c.id === id);
          const it = (level.iconTargets ?? []).find((i) => i.id === id);
          const tramp = (level.trampolines ?? []).find((t) => t.id === id);
          const ecx = wall?.cx ?? bumper?.cx ?? flipper?.anchorX ?? sling?.cx ?? kicker?.cx
           ?? lg?.cx ?? ct?.cx ?? it?.cx ?? tramp?.cx ?? pos.x;
          const ecy = wall?.cy ?? bumper?.cy ?? flipper?.anchorY ?? sling?.cy ?? kicker?.cy
           ?? lg?.cy ?? ct?.cy ?? it?.cy ?? tramp?.cy ?? pos.y;
          setDragOffset({ x: pos.x - ecx, y: pos.y - ecy });
          setDragging(id);
        }
      } else if (activeTool === "wall") {
        addWall(pos.x, pos.y);
        setActiveTool("select");
      } else if (activeTool === "bumper") {
        addBumper(pos.x, pos.y);
        setActiveTool("select");
      } else if (activeTool === "flipper") {
        addFlipper(pos.x, pos.y, flipperSide);
        setFlipperSide(!flipperSide);
        setActiveTool("select");
      } else if (activeTool === "sling") {
        addSling(pos.x, pos.y, flipperSide);
        setFlipperSide(!flipperSide);
        setActiveTool("select");
      } else if (activeTool === "kicker") {
        addKicker(pos.x, pos.y);
        setActiveTool("select");
      } else if (activeTool === "laneGuide") {
        addLaneGuide(pos.x, pos.y);
        setActiveTool("select");
      } else if (activeTool === "trampoline") {
        addTrampoline(pos.x, pos.y);
        setActiveTool("select");
      } else if (activeTool === "ballSpawn") {
        setBallSpawn(pos.x, pos.y);
        setActiveTool("select");
      }
    },
    [activeTool, level, flipperSide, getCanvasPos, setSelectedId, addWall, addBumper, addFlipper, addSling, 
      addKicker, addLaneGuide, addTrampoline, setBallSpawn, setActiveTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasPos(e);
      setHoverPos(pos);

      if (dragging) {
        moveElement(dragging, pos.x - dragOffset.x, pos.y - dragOffset.y);
      }
    },
    [dragging, dragOffset, getCanvasPos, moveElement]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        deleteElement(selectedId);
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setActiveTool("select");
      }
      // Rotate selected element: R = +10°, Shift+R = -10°
      if ((e.key === "r" || e.key === "R") && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? -0.1745 : 0.1745; // ~10 degrees in radians
        rotateElement(selectedId, step);
      }
      // Move selected element with arrow keys (5px steps, Shift = 1px)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 5;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        moveElement(selectedId, dx, dy, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, deleteElement, setSelectedId, setActiveTool, rotateElement, moveElement]);

  // Export JSON
  const exportLevel = useCallback(() => {
    const json = JSON.stringify(level, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${level.name || "level"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [level]);

  // Import JSON
  const importLevel = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const config = JSON.parse(reader.result as string) as LevelConfig;
          loadLevel(config);
        } catch {
          alert("Invalid level file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [loadLevel]);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Left toolbar */}
      <div className="w-48 bg-gray-900 border-r border-gray-800 flex flex-col">
        <h2 className="text-lg font-bold p-3 border-b border-gray-800 font-mono tracking-wider">
          EDITOR
        </h2>

        {/* Tool buttons */}
        <div className="flex flex-col gap-1 p-2">
          {tools.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTool(t.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                activeTool === t.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <span className="w-5 text-center">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Save / Load */}
        <div className="border-t border-gray-800 mt-2">
          <SavedLevelsPanel
            entries={levelEntries}
            onLoad={handleLoad}
            onSave={handleSave}
            onReload={handleReload}
            currentLevelName={level.name}
          />
        </div>

        {/* File I/O */}
        <div className="border-t border-gray-800 p-2 flex flex-col gap-1">
          <button
            onClick={exportLevel}
            className="px-3 py-1.5 rounded text-sm text-gray-400 hover:bg-gray-800 text-left"
          >
            Export JSON
          </button>
          <button
            onClick={importLevel}
            className="px-3 py-1.5 rounded text-sm text-gray-400 hover:bg-gray-800 text-left"
          >
            Import JSON
          </button>
          <button
            onClick={clearLevel}
            className="px-3 py-1.5 rounded text-sm text-red-400/60 hover:bg-gray-800 text-left"
          >
            Clear All
          </button>
        </div>

        {/* Properties */}
        <div className="border-t border-gray-800 mt-auto">
          <PropertiesPanel
            level={level}
            selectedId={selectedId}
            onUpdateWall={updateWall}
            onUpdateBumper={updateBumper}
            onDelete={deleteElement}
          />
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Level Name:</span>
            <input
              type="text"
              value={level.name}
              onChange={(e) => setLevelName(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm w-40"
            />
          </label>
          <button
            onClick={() => onPlay(level)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
          >
            ▶ Play Level
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          className="border-2 border-gray-700 rounded-lg cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <p className="text-gray-600 text-xs font-mono">
          Click to place • Drag or Arrow keys to move (Shift=1px) • R / Shift+R to rotate 10° • DEL to delete • ESC to deselect
        </p>
      </div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all animate-fade-in ${
          toast.type === "success" ? "bg-green-600 text-white" :
          toast.type === "error" ? "bg-red-600 text-white" :
          "bg-gray-700 text-gray-100"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
