import { makeFileUrl } from "@elllphnt/elementa-base";
import React from "react";
import { CodeViewer } from "./code_viewer.js";
import { ComponentViewer } from "./component_viewer.js";
import { RouterViewer } from "./router_viewer.js";

interface ContentViewerProps {
  projectId: string;
  fileId: string;
  type: string;
  path: string;
  codeOnlyMode?: boolean;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  projectId,
  fileId,
  type,
  codeOnlyMode = false,
}) => {
  const url = makeFileUrl({ projectId, fileId });
  if (!codeOnlyMode) {
    if (type === "component") {
      return <ComponentViewer url={url} />;
    } else if (type === "router") {
      return <RouterViewer url={url} />;
    }
  }
  return <CodeViewer url={url} />;
};
