import { useState, useEffect } from "react";
import PinballGame from "./game/PinballGame";
import LevelEditor from "./editor/LevelEditor";
import { LevelConfig } from "./levels/types";
import { listLevels, loadLevel } from "./levels/levelLoader";

type Mode =
  | { view: "loading" }
  | { view: "menu"; levels: LevelConfig[] }
  | { view: "play"; level: LevelConfig }
  | { view: "editor" };

export default function App() {
  const [mode, setMode] = useState<Mode>({ view: "loading" });

  // Load all levels on mount, then go straight to playing the first one
  useEffect(() => {
    (async () => {
      const entries = await listLevels();
      const configs: LevelConfig[] = [];
      for (const entry of entries) {
        try {
          configs.push(await loadLevel(entry));
        } catch { /* skip broken levels */ }
      }
      if (configs.length > 0) {
        setMode({ view: "play", level: configs[0] });
      } else {
        setMode({ view: "editor" });
      }
    })();
  }, []);

  if (mode.view === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p className="text-lg font-mono animate-pulse">Loading...</p>
      </div>
    );
  }

  if (mode.view === "play") {
    return (
      <PinballGame
        level={mode.level}
        onBack={() => setMode({ view: "editor" })}
      />
    );
  }

  return (
    <LevelEditor onPlay={(level) => setMode({ view: "play", level })} />
  );
}
