import {
  AsyncResourceStatus,
  parseAbsoluteFileUrl,
} from "@elllphnt/elementa-core";
import { useObservable } from "@elllphnt/elementa-react-utils";
import React from "react";
import { infrastructure } from "../libs/infrastructure";

interface CodeViewerProps {
  url: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ url }) => {
  const content = infrastructure.file(url).content;
  const status = useObservable(content.status$, content.status);
  const text = useObservable(content.text$, content.text);
  const error = useObservable(content.error$, content.error);

  const renderContent = () => {
    switch (status) {
      case AsyncResourceStatus.Pending:
        return (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading file...</div>
          </div>
        );

      case AsyncResourceStatus.Missing:
        return (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">File not found: {url}</div>
          </div>
        );

      case AsyncResourceStatus.Errored:
        return (
          <div className="flex items-center justify-center h-32">
            {JSON.stringify(parseAbsoluteFileUrl(url))}
            <div className="text-red-500">
              Error loading file: {error?.message || "Unknown error"}
            </div>
          </div>
        );

      case AsyncResourceStatus.Resolved:
        return (
          <div className="w-full h-full bg-gray-50">
            <pre className="p-4 rounded overflow-auto text-sm font-mono whitespace-pre-wrap">
              {text || "File is empty"}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Unknown status</div>
          </div>
        );
    }
  };

  return <div className="flex-1 h-full overflow-hidden">{renderContent()}</div>;
};
