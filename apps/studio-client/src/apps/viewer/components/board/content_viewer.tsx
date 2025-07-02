import { makeFileUrl } from "@elllphnt/elementa-base";
import React from "react";
import { CodeViewer } from "./code_viewer.js";
import { ComponentStage } from "./component_stage.js";
import { ComponentViewer } from "./component_viewer.js";
import { RouterViewer } from "./router_viewer.js";

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
  const url = makeFileUrl({ projectId, fileId });
  switch (mode) {
    case "code":
      return <CodeViewer url={url} />;
    case "preview":
      if (type === "component") {
        return <ComponentViewer url={url} />;
      } else if (type === "router") {
        return <RouterViewer url={url} />;
      } else {
        return <CodeViewer url={url} />;
      }
    case "stage":
      if (type === "component") {
        return <ComponentStage url={url} />;
      } else {
        return <CodeViewer url={url} />;
      }
    default:
      return <CodeViewer url={url} />;
  }
};
