import type { InMemoryInfrastructureData } from "@elllphnt/elementa-models";
import axios from "axios";
import { useEffect, useState } from "react";
import { ComponentViewer } from "./component_viewer";
import { InfraViewer } from "./infra_viewer";

export function Viewer({ tsx, css }: { tsx: string; css: string }) {
  const [result, setResult] = useState<{
    infra: InMemoryInfrastructureData;
    url: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"component" | "json">("component");

  useEffect(() => {
    const fetchData = async () => {
      if (!tsx || !css) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("http://localhost:3001/process", {
          tsx,
          css,
        });
        setResult(response.data);
      } catch (err) {
        console.error("Error fetching data from server:", err);
        setError(
          "Failed to process component. Please check server connection."
        );
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tsx, css]);

  if (loading) {
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  }

  if (!result) {
    return (
      <div style={{ color: "white", padding: "20px" }}>
        Enter TSX and CSS to render component
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() =>
            setViewMode(viewMode === "component" ? "json" : "component")
          }
          style={{
            padding: "6px 12px",
            backgroundColor: "#4a4a4a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          Show {viewMode === "component" ? "Infrastructure" : "Component"}
        </button>
      </div>

      {viewMode === "component" ? (
        <ComponentViewer infra={result.infra} url={result.url} />
      ) : (
        <InfraViewer infra={result.infra} />
      )}
    </div>
  );
}
