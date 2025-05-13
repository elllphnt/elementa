import type { AppBundle } from "@elllphnt/elementa-app-examples";
import { InMemoryInfrastructure } from "@elllphnt/elementa-models";
import {
  AppInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
} from "@elllphnt/elementa-runtime";
import {
  AppComponent,
  AppRenderable,
  DomStyleSheetManager,
  Scene,
} from "@elllphnt/elementa-scene";
import { createMemoryHistory } from "@tanstack/react-router";
import { useMemo } from "react";

const moduleHost = new InMemoryModuleHost();
const stylesheetManager = new DomStyleSheetManager();
const scene = new Scene({ stylesheetManager });

export function AppViewer({ bundle }: { bundle: AppBundle }) {
  const appRenderable = useMemo(() => {
    const infrastructure = new InMemoryInfrastructure(bundle.infra);
    const app = infrastructure.app(bundle.appUrl).model!; // instantly available because of the in memory infrastructure
    const moduleManager = new ModuleManager({
      infrastructure,
      moduleHost,
      externals: [],
    });
    const runtime = new Runtime({ moduleManager });
    const environment = new DefaultFragmentEnvironment({ runtime });

    const appRenderable = new AppRenderable({
      scene,
      history: createMemoryHistory({
        initialEntries: ["/"],
      }),
      instance: new AppInstance({
        model: app,
        environment,
      }),
    });
    return appRenderable;
  }, []);

  return <AppComponent app={appRenderable} />;
}
