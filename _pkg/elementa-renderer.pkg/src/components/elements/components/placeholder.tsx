import { Component } from "@repo/elementa-models";

export function ComponentPlaceHolder({ component }: { component?: Component }) {
  return (
    <div
      style={{
        backgroundColor: "#8881",
        border: "1px solid #8884",
        color: "#ddd4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        flexGrow: 0,
      }}
    >
      Loading {component?.name} ...
    </div>
  );
}
