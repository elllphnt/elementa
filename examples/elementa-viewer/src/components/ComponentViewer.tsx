import React from "react";

interface ComponentViewerProps {
  url: string;
}

export const ComponentViewer: React.FC<ComponentViewerProps> = ({ url }) => {
  return <div className="flex-1 p-6">{url}</div>;
};
