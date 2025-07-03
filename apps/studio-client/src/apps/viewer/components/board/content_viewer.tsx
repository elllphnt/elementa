/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeFileUrl } from "@elllphnt/elementa-base";
import type { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import React, { type ReactNode } from "react";
import { infrastructure } from "../../../../backend/infrastructure";
import { setSceneIframe, setSceneManager } from "../../state";
import { Inspector } from "../inspector/inspector";
import { CodeViewer } from "./code_viewer";
import { ComponentStage } from "./elementa_viewer/component_stage";
import { ComponentViewer } from "./elementa_viewer/component_viewer";
import { RouterViewer } from "./elementa_viewer/router_viewer";

interface ContentViewerProps {
  projectId: string;
  fileId: string;
  type: string;
  path: string;
  mode?: "code" | "preview" | "stage";
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  projectId,
  fileId,
  type,
  mode = "preview",
}) => {
  let elementa = false;
  let main: ReactNode | undefined = undefined;
  let side: ReactNode | undefined = undefined;

  const url = makeFileUrl({ projectId, fileId });

  switch (mode) {
    case "code":
      main = <CodeViewer url={url} />;
      break;
    case "preview":
      if (type === "component") {
        main = <ComponentViewer url={url} />;
        side = <Inspector />;
        elementa = true;
      } else if (type === "router") {
        main = <RouterViewer url={url} />;
        elementa = true;
      } else {
        main = <CodeViewer url={url} />;
      }
      break;
    case "stage":
      if (type === "component") {
        main = <ComponentStage url={url} />;
        side = <Inspector />;
        elementa = true;
      } else {
        main = <CodeViewer url={url} />;
      }
      break;
    default:
      main = <CodeViewer url={url} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-grow overflow-hidden h-full relative">
        <iframe
          ref={(ref) => setSceneIframe(ref)}
          style={{
            border: "none",
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            opacity: elementa ? 1 : 0,
          }}
          src="http://localhost:5174/editor"
          onLoad={(event) => {
            const iframe = event.currentTarget as HTMLIFrameElement;
            const window = iframe.contentWindow;
            if (window) {
              const manager = (window as any).init({
                infrastructure,
              }) as ElementaRenderableManager;
              setSceneManager(manager);
            }
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {main}
        </div>
      </div>
      {side ? (
        <div
          className="w-80 border-l border-fg-200 bg-white overflow-y-auto bg-bg"
          style={{ height: "100%" }}
        >
          {side}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
