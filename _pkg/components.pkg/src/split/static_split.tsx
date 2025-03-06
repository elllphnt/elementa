import { forwardRef } from "react";

export type StaticSplitProps = {
  segments?: (number | undefined)[];
  orientation?: "horizontal" | "vertical";
  children?: JSX.Element[];
  transition?: boolean;
} & Omit<JSX.IntrinsicElements["div"], "ref">;

export const StaticSplit = forwardRef<HTMLDivElement, StaticSplitProps>(
  function StaticSplit(
    {
      segments = [],
      orientation = "horizontal",
      children,
      style,
      transition,
      ...props
    },
    ref,
  ): JSX.Element {
    const isHorizontal = orientation === "horizontal";

    return (
      <div
        ref={ref}
        style={{
          ...style,
          flexDirection: isHorizontal ? "row" : "column",
          display: "flex",
          height: "100%",
          width: "100%",
        }}
        {...props}
      >
        {segments.map((size, index) => (
          <div
            style={{
              position: "relative",
              width: isHorizontal ? size : "100%",
              height: isHorizontal ? "100%" : size,
              flexGrow: size === undefined ? 1 : 0,
              flexShrink: 0,
              transitionProperty: transition
                ? isHorizontal
                  ? "width"
                  : "height"
                : undefined,
              transitionDuration: transition ? "0.2s" : undefined,
              transitionTimingFunction: "ease-out",
            }}
            key={index}
          >
            {children?.[index]}
          </div>
        ))}
      </div>
    );
  },
);

export default StaticSplit;
