import {
  ElementaStageModel,
  InMemoryInfrastructure,
} from "@elllphnt/elementa-models";
import {
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import {
  DomStyleSheetManager,
  ElementaStageManager,
  Renderable,
  Scene,
} from "@elllphnt/elementa-scene";
import { useEffect, useRef, useState } from "react";

const infrastructure = new InMemoryInfrastructure({
  projects: [
    {
      id: "1",
    },
  ],
  files: [],
});
const project = infrastructure.project("1");
const moduleHost = new InMemoryModuleHost();
const moduleManager = new ModuleManager({
  infrastructure,
  moduleHost,
  externals: [],
});
const stylesheetManager = new DomStyleSheetManager();
const runtime = new Runtime({ moduleManager });
const scene = new Scene({ stylesheetManager });

const stageModels = [
  new ElementaStageModel({
    project,
    init: {},
  }),
  new ElementaStageModel({
    project,
    init: {},
  }),
  new ElementaStageModel({
    project,
    init: {},
  }),
];

export function StageManager() {
  const managerRef = useRef<ElementaStageManager>(null);
  const managerRootref = useRef<HTMLDivElement>(null);
  const [stages, setStages] = useState<[Renderable, number][]>([]);

  useEffect(() => {
    if (managerRef.current || !managerRootref.current) {
      return;
    }
    const manager = new ElementaStageManager({
      root: managerRootref.current,
      runtime,
      scene,
    });

    const stages = stageModels.map((stage) => manager.addStage(stage));
    setStages(stages);

    managerRef.current = manager;
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
        <>
          {stages.map(([, key], i) => (
            <button
              key={i}
              onClick={() => managerRef.current?.activateStage(key)}
            >
              Stage {i}
            </button>
          ))}
        </>
      </div>
      <div style={{ flexGrow: 1, backgroundColor: "#ffffff" }}>
        <div id="board" ref={managerRootref} />
      </div>
    </div>
  );
}
