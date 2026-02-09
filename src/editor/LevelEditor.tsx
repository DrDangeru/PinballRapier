import { useRef, useEffect, useCallback, useState } from "react";
import { TABLE_WIDTH, TABLE_HEIGHT } from "../constants";
import { useEditorState } from "./useEditorState";
import { renderEditor, hitTest } from "./editorRenderer";
import PropertiesPanel from "./PropertiesPanel";
import SavedLevelsPanel from "./SavedLevelsPanel";
import { LevelConfig, ElementType } from "../levels/types";

interface Props {
  onPlay: (level: LevelConfig) => void;
}

const tools: { key: ElementType | "select" | "ballSpawn"; label: string; icon: string }[] = [
  { key: "select", label: "Select", icon: "↖" },
  { key: "wall", label: "Wall", icon: "▬" },
  { key: "bumper", label: "Bumper", icon: "●" },
  { key: "flipper", label: "Flipper", icon: "⏤" },
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
    setBallSpawn,
    moveElement,
    deleteElement,
    updateWall,
    updateBumper,
    setLevelName,
    loadLevel,
    clearLevel,
  } = useEditorState();

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
          const ecx = wall?.cx ?? bumper?.cx ?? flipper?.anchorX ?? pos.x;
          const ecy = wall?.cy ?? bumper?.cy ?? flipper?.anchorY ?? pos.y;
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
      } else if (activeTool === "ballSpawn") {
        setBallSpawn(pos.x, pos.y);
        setActiveTool("select");
      }
    },
    [activeTool, level, flipperSide, getCanvasPos, setSelectedId, addWall, addBumper, addFlipper, setBallSpawn, setActiveTool]
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, deleteElement, setSelectedId, setActiveTool]);

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
          <SavedLevelsPanel currentLevel={level} onLoad={loadLevel} />
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
          Click to place • Drag to move • DEL to delete • ESC to deselect
        </p>
      </div>
    </div>
  );
}
