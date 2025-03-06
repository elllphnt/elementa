import { combineLatestOrEmpty, VectorData } from "@repo/utils";
import _ from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { map } from "rxjs";
import { ICornerHandle as CornerHandleType } from "~/src/_types/handles/properties/corner";
import { useElementaInteractor } from "../../../hooks/elementa_interactor";
import { MouseInteraction } from "../../../tools/interactions/mouse";

const corners = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export function CornerHandle({ handle }: { handle: CornerHandleType }) {
  const editor = useElementaInteractor();
  const handleHtmlElementRefs = useRef({
    "top-left": null as HTMLDivElement | null,
    "top-right": null as HTMLDivElement | null,
    "bottom-left": null as HTMLDivElement | null,
    "bottom-right": null as HTMLDivElement | null,
  });

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      combineLatestOrEmpty(
        corners.map((name) => {
          return handle.corner$(name).pipe(
            map((corner) => {
              return corner ?? 0;
            }),
          );
        }),
      ).pipe(
        map(([topLeft, topRight, bottomLeft, bottomRight]) => ({
          topLeft,
          topRight,
          bottomLeft,
          bottomRight,
        })),
      ),
      handle.interfaceRect$,
      editor.stager.viewport.scale$,
    ]).subscribe(([corner, rect, scale]) => {
      const refs = handleHtmlElementRefs.current;
      const max = Math.min(rect?.width ?? 0, rect?.height ?? 0) / 2;
      const toCss = (corner: number) =>
        `${Math.min(max, Math.max(8, corner * scale))}px`;

      refs["top-left"]?.style.setProperty("left", toCss(corner.topLeft));
      refs["top-left"]?.style.setProperty("top", toCss(corner.topLeft));
      refs["top-right"]?.style.setProperty("right", toCss(corner.topRight));
      refs["top-right"]?.style.setProperty("top", toCss(corner.topRight));
      refs["bottom-left"]?.style.setProperty("left", toCss(corner.bottomLeft));
      refs["bottom-left"]?.style.setProperty(
        "bottom",
        toCss(corner.bottomLeft),
      );
      refs["bottom-right"]?.style.setProperty(
        "right",
        toCss(corner.bottomRight),
      );
      refs["bottom-right"]?.style.setProperty(
        "bottom",
        toCss(corner.bottomRight),
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCornerStart = useCallback(
    (e: React.DragEvent, corner: (typeof corners)[number]) => {
      e.preventDefault();
      e.stopPropagation();

      const mouseInteraction = new MouseInteraction();
      mouseInteraction.on("start", (e) => {
        editor.setFlag("corning", true);

        const initialCorner = Object.fromEntries(
          corners.map((corner) => {
            const value = handle.corner(corner);
            return [corner, value ?? 0];
          }),
        ) as { [key in (typeof corners)[number]]: number };

        const contentRect = handle.contentRect ?? {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        };

        const deltaSubscription = combineLatestOrEmpty([
          mouseInteraction.endPosition$,
          mouseInteraction.ctrlKey$,
        ]).subscribe(([interfaceEndPosition, individual]) => {
          const stagerEndPosition =
            editor.interface.interactorToStager(interfaceEndPosition);
          const contentEndPosition =
            editor.stager.viewport.windowToContent(stagerEndPosition);
          let delta: VectorData;
          switch (corner) {
            case "top-left":
              delta = {
                x: contentEndPosition.x - contentRect.x,
                y: contentEndPosition.y - contentRect.y,
              };
              break;
            case "top-right":
              delta = {
                x: contentRect.x + contentRect.width - contentEndPosition.x,
                y: contentEndPosition.y - contentRect.y,
              };
              break;
            case "bottom-left":
              delta = {
                x: contentEndPosition.x - contentRect.x,
                y: contentRect.y + contentRect.height - contentEndPosition.y,
              };
              break;
            case "bottom-right":
              delta = {
                x: contentRect.x + contentRect.width - contentEndPosition.x,
                y: contentRect.y + contentRect.height - contentEndPosition.y,
              };
              break;
          }

          const deltaCorner = Math.min(delta.x, delta.y);

          let newCorner = { ...initialCorner };
          if (individual) {
            newCorner[corner] = deltaCorner;
          } else {
            newCorner["top-left"] = deltaCorner;
            newCorner["top-right"] = deltaCorner;
            newCorner["bottom-left"] = deltaCorner;
            newCorner["bottom-right"] = deltaCorner;
          }

          // clamp
          const min = 0;
          const max = Math.min(contentRect.width, contentRect.height) / 2;
          newCorner["top-left"] = _.clamp(newCorner["top-left"], min, max);
          newCorner["top-right"] = _.clamp(newCorner["top-right"], min, max);
          newCorner["bottom-left"] = _.clamp(
            newCorner["bottom-left"],
            min,
            max,
          );
          newCorner["bottom-right"] = _.clamp(
            newCorner["bottom-right"],
            min,
            max,
          );

          // rounded
          corners.forEach((corner) => {
            handle.setCorner(corner, Math.round(newCorner[corner]));
          });
        });

        mouseInteraction.on("stop", () => {
          deltaSubscription.unsubscribe();
          mouseInteraction.dispose();

          setTimeout(() => {
            editor.setFlag("corning", false);
          }, 0);
        });
      });

      mouseInteraction.run(window, {
        x: e.clientX,
        y: e.clientY,
      });
    },
    [],
  );

  return (
    <>
      {corners.map((corner) => {
        return (
          <div
            key={corner}
            className={`elementa-corner-handle elementa-corner-handle-${corner}`}
            ref={(e) => (handleHtmlElementRefs.current[corner] = e)}
            draggable
            onDragStart={(e) => handleCornerStart(e, corner)}
          />
        );
      })}
    </>
  );
}
