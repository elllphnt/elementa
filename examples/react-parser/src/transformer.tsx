import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { Viewer } from "./viewer.js";

export function Transformer() {
  const [tsx, setTsx] = useState<string>("");
  const [css, setCss] = useState<string>("");

  useEffect(() => {
    // Load content from localStorage on initial render
    const savedTsx = localStorage.getItem("elementa-tsx") || "";
    const savedCss = localStorage.getItem("elementa-css") || "";
    setTsx(savedTsx);
    setCss(savedCss);
  }, []);

  const handleTsxChange = (value: string | undefined) => {
    const newValue = value || "";
    setTsx(newValue);
    localStorage.setItem("elementa-tsx", newValue);
  };

  const handleCssChange = (value: string | undefined) => {
    const newValue = value || "";
    setCss(newValue);
    localStorage.setItem("elementa-css", newValue);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: "50%",
            width: "100%",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue="// TSX editor"
            theme="vs-dark"
            path="component.tsx"
            value={tsx}
            onChange={handleTsxChange}
            beforeMount={(monaco) => {
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                {
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  target: monaco.languages.typescript.ScriptTarget.ESNext,
                  allowNonTsExtensions: true,
                }
              );
            }}
          />
        </div>
        <div style={{ height: "50%", width: "100%" }}>
          <Editor
            height="100%"
            defaultLanguage="css"
            defaultValue="/* CSS editor */"
            theme="vs-dark"
            value={css}
            onChange={handleCssChange}
          />
        </div>
      </div>
      <div
        style={{
          width: "50%",
          height: "100%",
          boxSizing: "border-box",
          backgroundColor: "#333",
        }}
      >
        <Viewer tsx={tsx} css={css} />
      </div>
    </div>
  );
}

export default Transformer;
