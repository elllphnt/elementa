import { useObservable } from "@elllphnt/elementa-react-utils";
import React, { useEffect } from "react";
import { infrastructure } from "../../../../backend/infrastructure";
import { sceneManager } from "../../../state.js";

const stageKeys = new Map<string, number>();

export const RouterViewer: React.FC<{ url: string }> = ({ url }) => {
  const manager = useObservable(
    sceneManager.asObservable(),
    sceneManager.getValue()
  );
  const routerAdaptor = infrastructure.router(url);
  const router = useObservable(routerAdaptor.model$, routerAdaptor.model);
  const status = useObservable(routerAdaptor.status$, routerAdaptor.status);

  console.debug("RouterViewer", {
    url,
    router,
    status,
    routerAdaptor,
  });

  useEffect(() => {
    if (manager) {
      const sub = routerAdaptor.model$.subscribe((router) => {
        if (router) {
          if (stageKeys.has(router.key)) {
            manager.activateRenderable(stageKeys.get(router.key)!);
          } else {
            const [, key] = manager.addPreview(router.preview);
            stageKeys.set(router.key, key);
            manager.activateRenderable(key);
          }
        }
      });
      return () => sub.unsubscribe();
    }
  }, [manager, routerAdaptor]);

  return null;
};
