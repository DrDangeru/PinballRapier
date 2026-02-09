import { LevelConfig } from "./types";

const STORAGE_KEY = "pinball-saved-levels";

export interface SavedLevel {
  name: string;
  savedAt: string;
  config: LevelConfig;
}

function getAll(): SavedLevel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(levels: SavedLevel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

export function getSavedLevels(): SavedLevel[] {
  return getAll();
}

export function saveLevel(config: LevelConfig): SavedLevel {
  const levels = getAll();
  const entry: SavedLevel = {
    name: config.name,
    savedAt: new Date().toISOString(),
    config: structuredClone(config),
  };

  // Overwrite if same name exists
  const idx = levels.findIndex((l) => l.name === config.name);
  if (idx >= 0) {
    levels[idx] = entry;
  } else {
    levels.push(entry);
  }

  persist(levels);
  return entry;
}

export function deleteSavedLevel(name: string) {
  const levels = getAll().filter((l) => l.name !== name);
  persist(levels);
}
