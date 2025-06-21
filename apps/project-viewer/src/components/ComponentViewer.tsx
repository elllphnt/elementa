/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResourceStatus } from "@elllphnt/elementa-core";
import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  ComponentRenderable,
  DomStyleSheetManager,
  ElementaRenderableManager,
  Scene,
} from "@elllphnt/elementa-scene";
import React, { useEffect, useMemo } from "react";
import {
  ComponentInstance,
  DefaultElementRuntimeEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentInputResolver,
} from "../../../../packages/runtime/build/index.js";
import { infrastructure } from "../libs/infrastructure.js";

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
    externals: ["react", "react-dom"],
  }),
});
const environment = new DefaultElementRuntimeEnvironment({ runtime });

export const ComponentViewer: React.FC<ComponentViewerProps> = ({ url }) => {
  const [manager, setManager] =
    React.useState<ElementaRenderableManager | null>(null);
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

  useEffect(() => {
    if (component?.preview && manager) {
      const [, key] = manager.addPreview(component.preview);
      manager.activateRenderable(key);
    }
  }, [manager, component]);

  if (!component) return <></>;

  if (status === AsyncResourceStatus.Pending) {
    return <div className="content-viewer">Loading component...</div>;
  } else if (status === AsyncResourceStatus.Errored) {
    return <div className="content-viewer">Error loading component</div>;
  } else if (renderable) {
    (window as any).renderable = renderable;
    return (
      <iframe
        key={url}
        style={{ height: "100%", width: "100%", border: "none" }}
        src="http://localhost:5174/editor"
        onLoad={(event) => {
          const iframe = event.currentTarget as HTMLIFrameElement;
          const window = iframe.contentWindow;
          if (window) {
            const manager = (window as any).init({
              infrastructure,
            }) as ElementaRenderableManager;
            setManager(manager);
          }
        }}
      />
    );
  }

  return <div></div>;
};
