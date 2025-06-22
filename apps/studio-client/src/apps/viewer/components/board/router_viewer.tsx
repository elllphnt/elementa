/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncResourceStatus } from "@elllphnt/elementa-core";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import React, { useEffect } from "react";
import { infrastructure } from "../../../../backend/infrastructure";

export const RouterViewer: React.FC<{ url: string }> = ({ url }) => {
  const [manager, setManager] =
    React.useState<ElementaRenderableManager | null>(null);
  const routerAdaptor = infrastructure.router(url);
  const router = useObservable(routerAdaptor.model$, routerAdaptor.model);
  const status = useObservable(routerAdaptor.status$, routerAdaptor.status);

  useEffect(() => {
    if (router?.preview && manager) {
      const [, key] = manager.addPreview(router.preview);
      manager.activateRenderable(key);
    }
  }, [manager, router]);

  if (!router) return <></>;

  if (status === AsyncResourceStatus.Pending) {
    return <div className="content-viewer">Loading router...</div>;
  } else if (status === AsyncResourceStatus.Errored) {
    return <div className="content-viewer">Error loading router</div>;
  } else {
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
};
