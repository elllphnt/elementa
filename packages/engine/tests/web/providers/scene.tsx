// SceneContext.tsx
import { DomStyleSheetManager, Scene } from "@elllphnt/elementa-scene";
import { createContext, useContext, useEffect, useState } from "react";

type SceneContextValue = {
  scene: Scene;
  stylesheetManager: DomStyleSheetManager;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<SceneContextValue | null>(null);

  useEffect(() => {
    const stylesheetManager = new DomStyleSheetManager();
    const scene = new Scene({ stylesheetManager });

    scene.initialize();
    stylesheetManager.initialize();

    setValue({ scene, stylesheetManager });

    return () => {
      scene.dispose();
      stylesheetManager.dispose();
    };
  }, []);

  return (
    <SceneContext.Provider value={value}>
      {value ? children : null}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("Scene not ready");
  return ctx;
}
