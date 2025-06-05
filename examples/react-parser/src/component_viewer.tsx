import {
  InMemoryInfrastructure,
  type InMemoryInfrastructureData,
} from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentInputResolver,
} from "@elllphnt/elementa-runtime";
import {
  ComponentComponent,
  ComponentRenderable,
  DomStyleSheetManager,
  Scene,
} from "@elllphnt/elementa-scene";
import { useMemo } from "react";

const moduleHost = new InMemoryModuleHost();
const stylesheetManager = new DomStyleSheetManager();
const scene = new Scene({ stylesheetManager });

export function ComponentViewer({
  url,
  infra,
  props,
}: {
  url: string;
  infra: InMemoryInfrastructureData;
  props?: { [key: string]: unknown };
}) {
  const renderable = useMemo(() => {
    const infrastructure = new InMemoryInfrastructure(infra);
    const component = infrastructure.component(url).model!; // instantly available because of the in memory infrastructure
    const moduleManager = new ModuleManager({
      infrastructure,
      moduleHost,
      externals: [],
    });
    const runtime = new Runtime({ moduleManager });
    const environment = new DefaultFragmentEnvironment({ runtime });

    const inputResolver = new StaticComponentInputResolver({
      environment,
      props,
    });

    const appRenderable = new ComponentRenderable({
      scene,
      instance: new ComponentInstance({
        model: component,
        inputResolver,
      }),
    });
    return appRenderable;
  }, [url, infra, props]);

  return <ComponentComponent component={renderable} />;
}
