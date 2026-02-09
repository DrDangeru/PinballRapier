import { useEffect, useRef, useState } from "react";
import RAPIER, { init, World } from "@dimforge/rapier2d-compat";

export function useRapier() {
  const [ready, setReady] = useState(false);
  const worldRef = useRef<World | null>(null);

  useEffect(() => {
    let cancelled = false;

    init().then(() => {
      if (cancelled) return;
      const gravity = new RAPIER.Vector2(0.0, 9.81);
      worldRef.current = new World(gravity);
      setReady(true);
    });

    return () => {
      cancelled = true;
      worldRef.current?.free();
      worldRef.current = null;
    };
  }, []);

  return { rapier: ready ? RAPIER : null, world: worldRef.current };
}
