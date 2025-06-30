import { parseAbsoluteFileUrl } from "@elllphnt/elementa-base";
import { AsyncResourceStatus } from "@elllphnt/elementa-models";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { Editor } from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import { infrastructure } from "../../../../backend/infrastructure";

interface CodeViewerProps {
  url: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ url }) => {
  const content = infrastructure.file(url).content;
  const status = useObservable(content.status$, content.status);
  const text = useObservable(content.text$, content.text);
  const error = useObservable(content.error$, content.error);

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const getLanguageFromUrl = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "json":
        return "json";
      case "css":
        return "css";
      case "html":
        return "html";
      case "md":
        return "markdown";
      case "yaml":
      case "yml":
        return "yaml";
      default:
        return "plaintext";
    }
  };

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
          <Editor
            height="100%"
            language={getLanguageFromUrl(url)}
            value={text || "// File is empty"}
            theme={isDarkMode ? "vs-dark" : "vs-light"}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Unknown status</div>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex-1 h-full overflow-hidden ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {renderContent()}
    </div>
  );
};
