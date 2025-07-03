import { useObservable } from "@elllphnt/elementa-react-utils";
import { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import React, { useEffect } from "react";
import { infrastructure } from "../../../../../backend/infrastructure.js";
import { sceneManager } from "../../../state.js";

interface ComponentViewerProps {
  url: string;
}

const stageKeys = new Map<string, number>();

export const ComponentViewer: React.FC<ComponentViewerProps> = ({ url }) => {
  const manager = useObservable(
    sceneManager.asObservable(),
    sceneManager.getValue()
  );
  React.useState<ElementaRenderableManager | null>(null);
  const componentAdaptor = infrastructure.component(url);

  useEffect(() => {
    if (manager) {
      const sub = componentAdaptor.model$.subscribe((component) => {
        if (component) {
          if (stageKeys.has(component.key)) {
            manager.activateRenderable(stageKeys.get(component.key)!);
          } else {
            const [, key] = manager.addPreview(component.preview);
            stageKeys.set(component.key, key);
            manager.activateRenderable(key);
          }
        }
      });
      return () => sub.unsubscribe();
    }
  }, [manager, componentAdaptor]);

  return null;
};
