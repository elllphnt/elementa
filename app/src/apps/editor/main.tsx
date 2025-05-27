import { InMemoryInfrastructure } from "@elllphnt/elementa-models";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(document as any).domain = "localhost";
console.log("Elementa Stage Manager initialized", (document as any).domain);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).init = ({
  infrastructure,
}: {
  infrastructure: InMemoryInfrastructure;
}) => {
  const moduleHost = new InMemoryModuleHost();
  const moduleManager = new ModuleManager({
    infrastructure,
    moduleHost,
    externals: [],
  });
  const stylesheetManager = new DomStyleSheetManager();

  const runtime = new Runtime({ moduleManager });
  const scene = new Scene({ stylesheetManager });

  const manager = new ElementaStageManager({
    root: document.getElementById("root")!,
    runtime,
    scene,
  });

  return manager;
};
