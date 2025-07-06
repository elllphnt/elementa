// InfrastructureContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { TestInfrastructureData } from "../infrastructure.js";
import { TestInfrastructure } from "../infrastructure.js";

export const InfrastructureContext = createContext<TestInfrastructure | null>(
  null
);

export function InfrastructureProvider({
  data,
  children,
}: {
  data: TestInfrastructureData;
  children: React.ReactNode;
}) {
  const [infrastructure, setInfrastructure] =
    useState<TestInfrastructure | null>(null);

  useEffect(() => {
    const infra = new TestInfrastructure({ data });
    infra.initialize();
    setInfrastructure(infra);

    return () => {
      infra.dispose();
    };
  }, [data]);

  return (
    <InfrastructureContext.Provider value={infrastructure}>
      {infrastructure ? children : null}
    </InfrastructureContext.Provider>
  );
}

export function useInfrastructure() {
  const value = useContext(InfrastructureContext);
  if (!value) throw new Error("Infrastructure not ready");
  return value;
}
