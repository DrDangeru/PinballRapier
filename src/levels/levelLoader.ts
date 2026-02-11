import { LevelConfig } from "./types";

export interface LevelEntry {
  filename: string;
  name: string;
}

function storageKey(filename: string) {
  return `pinball-level:${filename}`;
}

// Fetch the manifest of level filenames from public/levels/index.json
export async function listLevels(): Promise<LevelEntry[]> {
  try {
    const res = await fetch("/levels/index.json");
    if (!res.ok) return [];
    const filenames: string[] = await res.json();
    return filenames.map((f) => ({
      filename: f,
      name: f.replace(/\.json$/, ""),
    }));
  } catch {
    return [];
  }
}

// Load a level: localStorage override first, then fetch from public/levels/
export async function loadLevel(entry: LevelEntry): Promise<LevelConfig> {
  const saved = localStorage.getItem(storageKey(entry.filename));
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fall through */ }
  }
  const res = await fetch(`/levels/${entry.filename}`);
  if (!res.ok) throw new Error(`Failed to load level: ${entry.filename}`);
  return res.json();
}

// Save a level — overwrites the same filename in localStorage
export function saveLevel(config: LevelConfig, filename: string) {
  localStorage.setItem(storageKey(filename), JSON.stringify(config));
}

// Delete a saved override (reverts to the original JSON from public/levels/)
export function deleteLevel(filename: string) {
  localStorage.removeItem(storageKey(filename));
}
