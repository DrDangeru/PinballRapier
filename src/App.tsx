import { useState } from "react";
import PinballGame from "./game/PinballGame";
import LevelEditor from "./editor/LevelEditor";
import { LevelConfig } from "./levels/types";

type Mode = { view: "editor" } | { view: "play"; level: LevelConfig };

export default function App() {
  const [mode, setMode] = useState<Mode>({ view: "editor" });

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
