import { useObservable } from "@repo/utils";
import cx from "classnames";
import { memo } from "react";
import { SlotHandle } from "~/src/handles/entities/slot";
import { useHandleDom } from "./_hooks/interaction_target";
import { ElementHandleComponent } from "./element/element";

import React from "react";

function PatternFill({
  color = "#ccc",
  ...props
}: React.SVGProps<SVGSVGElement> & {
  color?: string;
}) {
  const patternId = "diagonal-stripes";

  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          {/* Vertical line */}
          <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="1" />
          {/* Horizontal line */}
          <line x1="0" y1="0" x2="10" y2="0" stroke={color} strokeWidth="1" />
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </svg>
  );
}

export const SlotHandleComponent = memo(function SlotHandleComponent({
  slot,
}: {
  slot: SlotHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(slot);
  const children = useObservable(slot.children$, slot.children);

  return (
    <>
      <div
        ref={(r) => {
          setRectHtmlElement(r);
          addInteractionTarget(r);
        }}
        className={cx(
          "interaction-target elementa-handle elementa-handle-slot",
        )}
      />
      {children.map((child) => (
        <ElementHandleComponent key={child.key} element={child as any} />
      ))}
    </>
  );
});
