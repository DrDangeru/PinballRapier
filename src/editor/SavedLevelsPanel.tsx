import { LevelEntry } from "../levels/levelLoader";

interface Props {
  entries: LevelEntry[];
  onLoad: (entry: LevelEntry) => void;
  onSave: () => void;
  onReload: () => void;
  currentLevelName: string;
}

export default function SavedLevelsPanel({ entries, onLoad, onSave, onReload, currentLevelName }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 pt-2">
        Levels
      </h3>

      {/* Save / Reload buttons */}
      <div className="flex flex-col gap-1 px-2">
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Save "{currentLevelName}"
        </button>
        <button
          onClick={onReload}
          className="px-3 py-1.5 rounded text-sm text-left text-gray-400 hover:bg-gray-800 transition-colors"
        >
          Reload from file
        </button>
      </div>

      {/* Levels list */}
      <div className="flex flex-col gap-0.5 px-1 max-h-48 overflow-y-auto">
        {entries.length === 0 && (
          <p className="text-gray-600 text-xs px-2 py-1">No levels found</p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.filename}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 group"
          >
            <button
              onClick={() => onLoad(entry)}
              className="flex-1 text-left text-sm text-gray-300 truncate"
              title={`Load "${entry.name}"`}
            >
              {entry.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
