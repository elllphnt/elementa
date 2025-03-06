import { PropsWithChildren, forwardRef } from "react";

export const RowControlContainer = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    justify?: "start" | "end" | "center" | "space-between";
  }>
>(function ({ children, justify }, ref) {
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
        justifyContent: justify ?? "start",
      }}
    >
      {children}
    </div>
  );
});
