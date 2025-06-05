import type {
  InMemoryFileData,
  InMemoryInfrastructureData,
} from "@elllphnt/elementa-models";
import { useState } from "react";

interface CollapsibleFileProps {
  file: InMemoryFileData;
}

const CollapsibleFile = ({ file }: CollapsibleFileProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginBottom: "10px",
        border: "1px solid #444",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          backgroundColor: "#333",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontWeight: "bold" }}>{file.name}</span>
          <span
            style={{ color: "#999", marginLeft: "10px", fontSize: "0.9em" }}
          >
            ID: {file.id}
          </span>
        </div>
        <div>{isOpen ? "▼" : "►"}</div>
      </div>

      {isOpen && (
        <div style={{ backgroundColor: "#222", padding: "10px" }}>
          <pre
            style={{
              margin: 0,
              overflowX: "auto",
              color: "#ddd",
              fontSize: "0.9em",
            }}
          >
            {file.content}
          </pre>
        </div>
      )}
    </div>
  );
};

export function InfraViewer({ infra }: { infra: InMemoryInfrastructureData }) {
  return (
    <div
      style={{
        padding: "15px",
        color: "white",
        overflowY: "scroll",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3>Infrastructure Files ({infra.files.length})</h3>

      {infra.files.map((file) => (
        <CollapsibleFile key={file.id} file={file} />
      ))}

      {infra.files.length === 0 && (
        <p style={{ color: "#999" }}>No files available</p>
      )}
    </div>
  );
}
