/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ElementaRenderableManager,
  ElementaStageRenderable,
} from "@elllphnt/elementa-scene";
import React, { useCallback, useEffect, useState } from "react";
import { infrastructure } from "../../../../backend/infrastructure.js";
import { Inspector } from "../inspector/inspector.js";
import { ViewportControls } from "./viewport-controls.js";

interface ComponentStageProps {
  url: string;
}

const ComponentIframe: React.FC<{
  url: string;
  onManagerReady: (manager: ElementaRenderableManager) => void;
}> = React.memo(({ url, onManagerReady }) => {
  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLIFrameElement>) => {
      const iframe = event.currentTarget as HTMLIFrameElement;
      const window = iframe.contentWindow;
      if (window) {
        const manager = (window as any).init({
          infrastructure,
        }) as ElementaRenderableManager;
        onManagerReady(manager);
      }
    },
    [onManagerReady]
  );

  return (
    <iframe
      key={url}
      style={{ height: "100%", width: "100%", border: "none" }}
      src="http://localhost:5174/editor"
      onLoad={handleLoad}
    />
  );
});

ComponentIframe.displayName = "ComponentIframe";

export const ComponentStage: React.FC<ComponentStageProps> = ({ url }) => {
  const [manager, setManager] =
    React.useState<ElementaRenderableManager | null>(null);
  const componentAdaptor = infrastructure.component(url);
  const [stage, setStage] = useState<ElementaStageRenderable | null>(null);

  useEffect(() => {
    if (manager) {
      const sub = componentAdaptor.model$.subscribe((component) => {
        if (component) {
          const [stage, key] = manager.addStage(component.stage);
          setStage(stage);
          manager.activateRenderable(key);
        }
      });
      return () => sub.unsubscribe();
    }
  }, [manager, componentAdaptor]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        <ComponentIframe url={url} onManagerReady={setManager} />
        <ViewportControls viewport={stage?.viewport || null} />
      </div>
      <div className="w-80 border-l border-fg-200 bg-white">
        <Inspector manager={manager} />
      </div>
    </div>
  );
};
