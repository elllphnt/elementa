// RuntimeContext.tsx
import {
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { useInfrastructure } from "./infrastructure.js";

type RuntimeContextValue = {
  runtime: Runtime;
  moduleManager: ModuleManager;
  moduleHost: InMemoryModuleHost;
};

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({
  externals = [],
  children,
}: {
  externals?: string[];
  children: React.ReactNode;
}) {
  const infrastructure = useInfrastructure();
  const [value, setValue] = useState<RuntimeContextValue | null>(null);

  useEffect(() => {
    const moduleHost = new InMemoryModuleHost();
    const moduleManager = new ModuleManager({
      infrastructure,
      moduleHost,
      externals,
    });
    const runtime = new Runtime({ moduleManager });

    moduleManager.initialize();
    runtime.initialize();

    setValue({ runtime, moduleManager, moduleHost });

    return () => {
      runtime.dispose();
      moduleManager.dispose();
    };
  }, [infrastructure, externals.join(",")]);

  return (
    <RuntimeContext.Provider value={value}>
      {value ? children : null}
    </RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const ctx = useContext(RuntimeContext);
  if (!ctx) throw new Error("Runtime not ready");
  return ctx;
}
