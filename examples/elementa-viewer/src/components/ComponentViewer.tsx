import { AsyncResourceStatus } from "@elllphnt/elementa-core";
import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  ComponentComponent,
  ComponentRenderable,
  DomStyleSheetManager,
  Scene,
} from "@elllphnt/elementa-scene";
import React, { useMemo } from "react";
import {
  ComponentInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentInputResolver,
} from "../../../../packages/runtime/build";
import { infrastructure } from "../libs/infrastructure";

interface ComponentViewerProps {
  url: string;
}

const scene = new Scene({
  stylesheetManager: new DomStyleSheetManager(),
});
const runtime = new Runtime({
  moduleManager: new ModuleManager({
    infrastructure,
    moduleHost: new InMemoryModuleHost(),
    externals: [],
  }),
});
const environment = new DefaultFragmentEnvironment({ runtime });

export const ComponentViewer: React.FC<ComponentViewerProps> = ({ url }) => {
  const componentAdaptor = infrastructure.component(url);
  const component = useObservable(
    componentAdaptor.model$,
    componentAdaptor.model
  );
  const status = useObservable(
    componentAdaptor.status$,
    componentAdaptor.status
  );
  const renderable = useMemo(() => {
    const inputResolver = new StaticComponentInputResolver({ environment });
    return component
      ? new ComponentRenderable({
          instance: new ComponentInstance({
            model: component,
            inputResolver,
          }),
          scene,
        })
      : null;
  }, [component]);

  if (!component) return <></>;

  if (status === AsyncResourceStatus.Pending) {
    return <div className="content-viewer">Loading component...</div>;
  } else if (status === AsyncResourceStatus.Errored) {
    return <div className="content-viewer">Error loading component</div>;
  } else if (renderable) {
    return (
      <div className="content-viewer">
        <ComponentComponent component={renderable} />
      </div>
    );
  }

  return <div></div>;
};
