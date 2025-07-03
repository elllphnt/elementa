import type { ResizableHandle } from "~/handles/_types/resizable.js";
import { SizeInput } from "./input.js";

export function SizeControl({ handles }: { handles: ResizableHandle[] }) {
  return (
    <div
      style={{
        background: "#08f",
        color: "white",
        padding: "2px 4px",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        pointerEvents: "auto",
      }}
    >
      <SizeInput
        handles={handles}
        value={(instance) => instance.width}
        value$={(instance) => instance.width$}
        setValue={(instance, value) => instance.setWidth(value)}
      />
      &times;
      <SizeInput
        handles={handles}
        value={(instance) => instance.height}
        value$={(instance) => instance.height$}
        setValue={(instance, value) => instance.setHeight(value)}
      />
    </div>
  );
}
