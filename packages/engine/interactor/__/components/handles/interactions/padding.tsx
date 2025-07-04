import type { LengthData } from "@elllphnt/elementa-base";
import { extractEvaluable } from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import _ from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { map, switchMap } from "rxjs";
import { lengthToPixels } from "~/_lib/utils";
import type { ElementHandle, FrameWidgetHandle } from "~/handles/_";
import { useElementaInteractor } from "../../../hooks/elementa_interactor.js";
import { MouseInteraction } from "../../../tools/interactions/mouse.js";

const edges = ["top", "right", "bottom", "left"] as const;

export function PaddingHandle({ handle }: { handle: ElementHandle }) {
  const editor = useElementaInteractor();
  const handleHtmlElementRefs = useRef({
    top: null as HTMLDivElement | null,
    right: null as HTMLDivElement | null,
    bottom: null as HTMLDivElement | null,
    left: null as HTMLDivElement | null,
  });

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      combineLatestOrEmpty([
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-top"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-right"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-bottom"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left"))
        ),
      ]).pipe(
        map(([top, right, bottom, left]) => ({
          top: extractEvaluable<LengthData | undefined>(top as any)[1] ?? {
            value: 0,
            unit: "px",
          },
          right: extractEvaluable<LengthData | undefined>(right as any)[1] ?? {
            value: 0,
            unit: "px",
          },
          bottom: extractEvaluable<LengthData | undefined>(
            bottom as any
          )[1] ?? {
            value: 0,
            unit: "px",
          },
          left: extractEvaluable<LengthData | undefined>(left as any)[1] ?? {
            value: 0,
            unit: "px",
          },
        }))
      ),
      editor.stager.viewport.scale$,
    ]).subscribe(([padding, scale]) => {
      const refs = handleHtmlElementRefs.current;
      const toCss = (padding: LengthData) =>
        `${Math.max(0, lengthToPixels(padding) * scale * 0.5)}px`;

      refs["top"]?.style.setProperty("top", toCss(padding.top));
      refs["left"]?.style.setProperty("left", toCss(padding.left));
      refs["right"]?.style.setProperty("right", toCss(padding.right));
      refs["bottom"]?.style.setProperty("bottom", toCss(padding.bottom));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePaddingStart = useCallback(
    (e: React.DragEvent, edge: (typeof edges)[number]) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = handle.contentRect;

      const mouseInteraction = new MouseInteraction();
      mouseInteraction.on("start", (e) => {
        editor.setFlag("padding", true);

        const initialPadding = Object.fromEntries(
          edges.map((edge) => [
            edge,
            extractEvaluable<number | undefined>(
              handle.padding(edge) as any
            )[1] ?? 0,
          ])
        ) as { [key in (typeof edges)[number]]: number };

        const deltaSubscription = combineLatestOrEmpty([
          mouseInteraction.endPosition$,
          mouseInteraction.ctrlKey$,
          mouseInteraction.altKey$,
        ]).subscribe(([interfacePosition, individual, symetrical]) => {
          let paddingValue = 0;

          const stagerEndPosition =
            editor.interface.interactorToStager(interfacePosition);
          const contentPosition =
            editor.stager.viewport.windowToContent(stagerEndPosition);

          switch (edge) {
            case "top":
              paddingValue = contentPosition.y - rect.y;
              break;
            case "right":
              paddingValue = rect.x + rect.width - contentPosition.x;
              break;
            case "bottom":
              paddingValue = rect.y + rect.height - contentPosition.y;
              break;
            case "left":
              paddingValue = contentPosition.x - rect.x;
              break;
          }

          paddingValue = 2 * paddingValue; // because the handle is half way from the container edge to the content edge

          let newPadding = { ...initialPadding };
          if (individual) {
            newPadding[edge] = paddingValue;
          } else if (symetrical) {
            if (edge === "top" || edge === "bottom") {
              newPadding.top = paddingValue;
              newPadding.bottom = paddingValue;
            } else {
              newPadding.left = paddingValue;
              newPadding.right = paddingValue;
            }
          } else {
            newPadding = {
              top: paddingValue,
              right: paddingValue,
              bottom: paddingValue,
              left: paddingValue,
            };
          }

          // clamp
          const min = 0;
          const max = Number.MAX_SAFE_INTEGER;
          newPadding.top = _.clamp(newPadding.top, min, max);
          newPadding.right = _.clamp(newPadding.right, min, max);
          newPadding.bottom = _.clamp(newPadding.bottom, min, max);
          newPadding.left = _.clamp(newPadding.left, min, max);

          // rounded
          edges.forEach((edge) => {
            handle.setPadding(edge, Math.round(newPadding[edge]));
          });
        });

        mouseInteraction.on("stop", () => {
          deltaSubscription.unsubscribe();
          mouseInteraction.dispose();

          setTimeout(() => {
            editor.setFlag("padding", false);
          }, 0);
        });
      });

      mouseInteraction.run(window, {
        x: e.clientX,
        y: e.clientY,
      });
    },
    []
  );

  return (
    <>
      {edges.map((edge) => (
        <div
          key={edge}
          ref={(e) => (handleHtmlElementRefs.current[edge] = e)}
          className={`elementa-padding-handle elementa-padding-handle-${edge}`}
          draggable
          onDragStart={(e) => handlePaddingStart(e, edge)}
        />
      ))}
    </>
  );
}

export function FramePaddingHandle({ handle }: { handle: FrameWidgetHandle }) {
  // const page = useObservable(handle.page$, handle.page);

  // if (!page) return null;

  // return <PaddingHandle handle={page} />;
  return <></>;
}
