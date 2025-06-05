import Editor from "@monaco-editor/react";
import axios from "axios";
import { useEffect, useState } from "react";

export function StandardizeView() {
  const [tsx, setTsx] = useState<string>("");
  const [standardizedTsx, setStandardizedTsx] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load content from localStorage on initial render
    const savedTsx = localStorage.getItem("elementa-std-tsx") || "";
    setTsx(savedTsx);
  }, []);

  useEffect(() => {
    const standardizeTsx = async () => {
      if (!tsx) {
        setStandardizedTsx("");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("http://localhost:3001/standardize", {
          tsx,
        });
        setStandardizedTsx(response.data.standardizedTsx);
      } catch (err) {
        console.error("Error standardizing TSX:", err);
        setError(
          "Failed to standardize component. Please check server connection."
        );
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(() => {
      standardizeTsx();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tsx]);

  const handleTsxChange = (value: string | undefined) => {
    const newValue = value || "";
    setTsx(newValue);
    localStorage.setItem("elementa-std-tsx", newValue);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "100%",
          boxSizing: "border-box",
          borderRight: "1px solid #ccc",
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue="// Enter your TSX code here"
          theme="vs-dark"
          path="component.tsx"
          value={tsx}
          onChange={handleTsxChange}
          beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              jsx: monaco.languages.typescript.JsxEmit.React,
              target: monaco.languages.typescript.ScriptTarget.ESNext,
              allowNonTsExtensions: true,
            });
          }}
        />
      </div>
      <div
        style={{
          width: "50%",
          height: "100%",
          boxSizing: "border-box",
          backgroundColor: "#1e1e1e",
        }}
      >
        {loading ? (
          <div style={{ color: "white", padding: "20px" }}>
            Standardizing...
          </div>
        ) : error ? (
          <div style={{ color: "red", padding: "20px" }}>{error}</div>
        ) : (
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue="// Standardized TSX will appear here"
            theme="vs-dark"
            value={standardizedTsx}
            options={{ readOnly: true }}
          />
        )}
      </div>
    </div>
  );
}
