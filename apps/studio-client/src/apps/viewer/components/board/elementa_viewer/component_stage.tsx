import {
  ElementaInteractor,
  ElementaInteractorComponent,
} from "@elllphnt/elementa-interactor";
import "@elllphnt/elementa-interactor/styles/main.css";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { ElementaStageRenderable } from "@elllphnt/elementa-scene";
import React, { useEffect, useMemo, useState } from "react";
import { infrastructure } from "../../../../../backend/infrastructure.js";
import { sceneIframe, sceneManager } from "../../../state.js";

interface ComponentStageProps {
  url: string;
}

const stageKeys = new Map<string, number>();

export const ComponentStage: React.FC<ComponentStageProps> = ({ url }) => {
  const manager = useObservable(
    sceneManager.asObservable(),
    sceneManager.getValue()
  );
  const componentAdaptor = infrastructure.component(url);
  const [stage, setStage] = useState<ElementaStageRenderable | null>(null);

  const interactor = useMemo(() => {
    if (stage) return new ElementaInteractor({ stage });
    else return undefined;
  }, [stage]);

  useEffect(() => {
    if (manager) {
      const sub = componentAdaptor.model$.subscribe((component) => {
        if (component) {
          let stage: ElementaStageRenderable | null = null;
          if (stageKeys.has(component.key)) {
            const key = stageKeys.get(component.key)!;
            stage = manager.getStage(key) as ElementaStageRenderable;
            manager.activateRenderable(key);
          } else {
            const [stg, key] = manager.addStage(component.stage);
            stageKeys.set(component.key, key);
            stage = stg;
            manager.activateRenderable(key);
          }

          setStage(stage);
        }
      });
      return () => sub.unsubscribe();
    }
  }, [manager, componentAdaptor]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (interactor && entries.length > 0) {
        const entry = entries[0];
        interactor.interface.setStagerRect(
          entry.target.getBoundingClientRect()
        );
      }
    });
    const sub = sceneIframe.subscribe((iframe) => {
      if (iframe) {
        observer.observe(iframe);
        interactor?.interface.setStagerRect(iframe.getBoundingClientRect());
        return () => {
          observer.unobserve(iframe);
        };
      } else {
        observer.disconnect();
      }
    });
    return () => sub.unsubscribe();
  }, [interactor]);

  return (
    <div className="flex h-full w-full" style={{ pointerEvents: "auto" }}>
      {interactor ? (
        <ElementaInteractorComponent
          key={interactor.key}
          interactor={interactor}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
