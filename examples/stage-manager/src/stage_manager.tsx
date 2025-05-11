import {
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import {
  DomStyleSheetManager,
  ElementaStageManager,
  Scene,
} from "@elllphnt/elementa-scene";
import { useEffect, useRef } from "react";

const infrastructure = new Infrastrure();
const moduleHost = new InMemoryModuleHost();
const moduleManager = new ModuleManager({
  infrastructure,
  moduleHost,
});
const stylesheetManager = new DomStyleSheetManager();
const runtime = new Runtime({ moduleManager });
const scene = new Scene({ stylesheetManager });

export function SideBar() {
  return <>Side Bar</>;
}

export function StageManager() {
  const managerRef = useRef<ElementaStageManager>(null);
  const managerRootref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (managerRef.current || !managerRootref.current) {
      return;
    }
    const manager = new ElementaStageManager({
      root: managerRootref.current,
      runtime,
      scene,
    });
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "200px", backgroundColor: "#f0f0f0" }}>
        <SideBar />
      </div>
      <div style={{ flexGrow: 1, backgroundColor: "#ffffff" }}>
        <div id="board" ref={managerRootref} />
      </div>
    </div>
  );
}
