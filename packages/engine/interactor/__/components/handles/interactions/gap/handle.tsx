import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import _ from "lodash";
import { forwardRef, useCallback } from "react";
import { lengthToPixels } from "~/_lib/utils";
import { ElementHandle } from "~/handles/_";
import { useElementaInteractor } from "~/hooks/elementa_interactor";
import { MouseInteraction } from "~/tools/interactions/mouse";

export const GapHandleHandle = forwardRef<
  HTMLDivElement,
  {
    element: ElementHandle;
  }
>(function ({ element }, ref) {
  const editor = useElementaInteractor();

  const handleGapStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const direction = (e.currentTarget as HTMLElement).dataset.gapDirection;

    const mouseInteraction = new MouseInteraction();
    mouseInteraction.on("start", (e) => {
      editor.setFlag("gapping", true);
      if (direction === "vertical") {
        editor.setFlag("gapping-x", true);
      } else {
        editor.setFlag("gapping-y", true);
      }

      const style = element.style;
      const initialGap = {
        x: element.style.resolvedPropertyValue("gap-x") ?? {
          value: 0,
          unit: "px",
        },
        y: element.style.resolvedPropertyValue("gap-x") ?? {
          value: 0,
          unit: "px",
        },
      };

      const deltaSubscription = combineLatestOrEmpty([
        mouseInteraction.deltaPosition$,
        mouseInteraction.ctrlKey$,
        mouseInteraction.altKey$,
      ]).subscribe(([delta, individual, symetrical]) => {
        let deltaGapValue = 0;

        if (direction === "vertical") {
          deltaGapValue = delta.x / editor.stager.viewport.scale;
        } else {
          deltaGapValue = delta.y / editor.stager.viewport.scale;
        }

        const newGap = {
          x: _.clamp(
            lengthToPixels(initialGap.x, "x") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER
          ),
          y: _.clamp(
            lengthToPixels(initialGap.y, "y") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER
          ),
        };

        // rounded
        if (direction === "vertical") {
          style.setProperty("gap-x", {
            value: Math.round(newGap.x ?? 0),
            unit: "px",
          });
        } else {
          style.setProperty("gap-y", {
            value: Math.round(newGap.y ?? 0),
            unit: "px",
          });
        }
      });

      mouseInteraction.on("stop", () => {
        deltaSubscription.unsubscribe();
        mouseInteraction.dispose();

        setTimeout(() => {
          editor.setFlag("gapping", false);
          if (direction === "vertical") {
            editor.setFlag("gapping-x", false);
          } else {
            editor.setFlag("gapping-y", false);
          }
        }, 0);
      });
    });

    mouseInteraction.run(window, {
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  return (
    <div
      ref={ref}
      className="elementa-gap-handle"
      draggable
      onDragStart={handleGapStart}
    >
      <div className="elementa-gap-handle-handle" />
    </div>
  );
});
