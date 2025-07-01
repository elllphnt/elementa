/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import React, { useCallback, useEffect } from "react";
import { infrastructure } from "../../../../backend/infrastructure.js";
import { Inspector } from "../inspector/inspector";

interface ComponentViewerProps {
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

export const ComponentViewer: React.FC<ComponentViewerProps> = ({ url }) => {
  const [manager, setManager] =
    React.useState<ElementaRenderableManager | null>(null);
  const componentAdaptor = infrastructure.component(url);

  useEffect(() => {
    if (manager) {
      const sub = componentAdaptor.model$.subscribe((component) => {
        if (component) {
          const [, key] = manager.addPreview(component.preview);
          manager.activateRenderable(key);
        }
      });
      return () => sub.unsubscribe();
    }
  }, [manager, componentAdaptor]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <ComponentIframe url={url} onManagerReady={setManager} />
      </div>
      <div className="w-80 border-l border-fg-200 bg-white">
        <Inspector manager={manager} />
      </div>
    </div>
  );
};
