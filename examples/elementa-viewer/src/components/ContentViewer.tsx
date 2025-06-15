import { makeFileUrl } from "@elllphnt/elementa-core";
import React from "react";
import { CodeViewer } from "./CodeViewer";
import { ComponentViewer } from "./ComponentViewer";

interface ContentViewerProps {
  projectId: string;
  fileId: string;
  type: string;
  path: string;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  projectId,
  fileId,
  type,
}) => {
  const url = makeFileUrl({ projectId, fileId });
  if (type === "component") {
    return <ComponentViewer url={url} />;
  }
  return <CodeViewer url={url} />;
};
