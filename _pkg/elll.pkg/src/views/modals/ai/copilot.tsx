import { useObservable } from "@repo/utils";
import { useElll } from "~/src/hooks/elll/elll";

export function CopilotModal() {
  const elll = useElll();
  const copilot = elll.copilot;
  const generations = useObservable(copilot.generations$, copilot.generations);

  // Helper to return indicator color based on status
  const statusColor = (status: string) => {
    switch (status) {
      case "running":
        return "#007bff"; // blue
      case "complete":
        return "#28a745"; // green
      case "error":
        return "#dc3545"; // red
      default:
        return "#6c757d"; // gray (for idle)
    }
  };

  return (
    <div
      className="el-p-3"
      style={{
        width: 300,
        height: 400,
      }}
    >
      {/* Show message if no generations */}
      {generations.length === 0 && (
        <p className="el-text-fg-400">No generations available.</p>
      )}

      {/* Render a card for each generation */}
      <div className="el-space-y-3">
        {generations.map((gen, index) => (
          <div key={index} className="el-border el-rounded el-p-3 el-shadow-sm">
            <div className="el-flex el-items-center el-gap-2">
              <span
                className="el-inline-block el-w-3 el-h-3 el-rounded-full"
                style={{ backgroundColor: statusColor(gen.status) }}
              />
              <span className="el-font-bold">{gen.title || "Untitled"}</span>
            </div>
            <p className="el-text-sm">Status: {gen.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
