import React, {
  type JSX,
  type PropsWithChildren,
  forwardRef,
  useContext,
} from "react";
import { TreeContext } from "./tree_context";

export type TreeEntryRawProps = PropsWithChildren<{
  icon?: React.ReactNode;
}> &
  Omit<JSX.IntrinsicElements["div"], "ref" | "prefix">;

export const TreeEntryRaw = forwardRef<HTMLDivElement, TreeEntryRawProps>(
  function TreeEntry({ children, style, ...props }, ref) {
    const { depthOffset, depth, depthUnit } = useContext(TreeContext);

    return (
      <div
        ref={ref}
        {...props}
        style={{
          display: "flex",
          ...style,
        }}
      >
        <div
          style={{
            width: depthOffset + depth * depthUnit,
            flexShrink: 0,
          }}
        />
        {children}
      </div>
    );
  }
);
