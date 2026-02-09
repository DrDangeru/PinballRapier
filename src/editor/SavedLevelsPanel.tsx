import { useState, useEffect, useCallback } from "react";
import { LevelConfig } from "../levels/types";
import { getSavedLevels, saveLevel, deleteSavedLevel, SavedLevel } from "../levels/storage";

interface Props {
  currentLevel: LevelConfig;
  onLoad: (config: LevelConfig) => void;
}

export default function SavedLevelsPanel({ currentLevel, onLoad }: Props) {
  const [levels, setLevels] = useState<SavedLevel[]>([]);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveName, setSaveName] = useState("");

  const refresh = useCallback(() => {
    setLevels(getSavedLevels());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = useCallback(() => {
    if (!currentLevel.name.trim()) return;
    saveLevel(currentLevel);
    refresh();
  }, [currentLevel, refresh]);

  const handleSaveAs = useCallback(() => {
    const name = saveName.trim();
    if (!name) return;
    const config = { ...structuredClone(currentLevel), name };
    saveLevel(config);
    setShowSaveAs(false);
    setSaveName("");
    refresh();
  }, [saveName, currentLevel, refresh]);

  const handleDelete = useCallback(
    (name: string) => {
      deleteSavedLevel(name);
      refresh();
    },
    [refresh]
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 pt-2">
        Saved Levels
      </h3>

      {/* Save buttons */}
      <div className="flex flex-col gap-1 px-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Save "{currentLevel.name}"
        </button>
        <button
          onClick={() => {
            setSaveName(currentLevel.name);
            setShowSaveAs(true);
          }}
          className="px-3 py-1.5 rounded text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Save As...
        </button>
      </div>

      {/* Save As dialog */}
      {showSaveAs && (
        <div className="mx-2 p-2 bg-gray-800 rounded border border-gray-700 flex flex-col gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveAs()}
            placeholder="Level name..."
            autoFocus
            className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSaveAs}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveAs(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved levels list */}
      <div className="flex flex-col gap-0.5 px-1 max-h-48 overflow-y-auto">
        {levels.length === 0 && (
          <p className="text-gray-600 text-xs px-2 py-1">No saved levels yet</p>
        )}
        {levels.map((l) => (
          <div
            key={l.name}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 group"
          >
            <button
              onClick={() => onLoad(l.config)}
              className="flex-1 text-left text-sm text-gray-300 truncate"
              title={`Load "${l.name}"`}
            >
              {l.name}
            </button>
            <button
              onClick={() => handleDelete(l.name)}
              className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1"
              title="Delete"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
