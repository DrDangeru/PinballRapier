import { LevelConfig } from "./types";

export interface LevelEntry {
  filename: string;
  name: string;
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

// Load a level JSON from public/levels/
export async function loadLevel(entry: LevelEntry): Promise<LevelConfig> {
  const res = await fetch(`/levels/${entry.filename}`);
  if (!res.ok) throw new Error(`Failed to load level: ${entry.filename}`);
  return res.json();
}

// Save a level — writes the JSON file to public/levels/ via dev API
export async function saveLevel(config: LevelConfig, filename: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/levels/${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config, null, 2),
    });
    return res.ok;
  } catch {
    return false;
  }
}
