import { constantOf } from "@elllphnt/elll-element";
import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import _ from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import { switchMap } from "rxjs";
import { lengthToPixels } from "~/src/_lib/utils";
import { ContainerElementHandle, ElementHandle } from "~/src/handles/_";
import { useElementaInteractor } from "../../../hooks/elementa_interactor";
import { MouseInteraction } from "../../../tools/interactions/mouse";

export function GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const children = useObservable(handle.children$, handle.children);

  return (
    <GapHandleContent handle={handle} children={children as ElementHandle[]} />
  );
}
// export function FrameGapHandle({ handle }: { handle: FrameWidgetHandle }) {
//   const page = useObservable(handle.$, handle.page);
//   const children = useObservable(page?.children$, page?.children);

//   if (!page || !children) return null;

//   return <GapHandleContent handle={page} children={children} />;
// }

function GapHandleContent({
  handle,
  children,
}: {
  handle: ElementHandle;
  children: ElementHandle[];
}) {
  const handleElements: React.ReactNode[] = [];

  for (let i = 0; i < children.length - 1; i++) {
    const before = children[i];
    const after = children[i + 1];
    handleElements.push(
      <GapHandleHandle
        key={`${before.key}:${after.key}`}
        handle={handle}
        before={before}
        after={after}
      />,
    );
  }

  return <>{handleElements}</>;
}

function GapHandleHandle({
  handle,
  before,
  after,
}: {
  handle: ElementHandle;
  before: ElementHandle;
  after: ElementHandle;
}) {
  const editor = useElementaInteractor();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shapeSubscription = combineLatestOrEmpty([
      handle.interfaceRect$,
      handle.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("display")),
      ),
      handle.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("flex-direction")),
      ),
      before.interfaceRect$,
      after.interfaceRect$,
      before.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("position")),
      ),
      after.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("position")),
      ),
      editor.stager.viewport.scale$,
      combineLatestOrEmpty([
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left")),
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-right")),
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-bottom")),
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left")),
        ),
      ]),
    ]).subscribe(
      ([
        instanceRect,
        layout,
        direction,
        beforeRect,
        afterRect,
        beforePosition,
        afterPosition,
        scale,
        paddings,
      ]) => {
        const padding = {
          top: paddings[0] ?? 0,
          right: paddings[1] ?? 0,
          bottom: paddings[2] ?? 0,
          left: paddings[3] ?? 0,
        };

        if (!instanceRect) {
          return;
        }

        const container = containerRef.current;
        const _handle = handleRef.current;

        if (!container || !_handle || !beforeRect || !afterRect) {
          return;
        }

        if (
          [beforePosition, afterPosition].some(
            (position) => position === "absolute" || position === "fixed",
          )
        ) {
          container?.style.setProperty("display", "none");
        } else {
          container?.style.removeProperty("display");
        }

        let top = 0,
          left = 0,
          right = 0,
          bottom = 0;
        let cursor = "ns-resize";
        let rotate = "rotate(0deg)";

        if (!direction || direction === "row") {
          top = lengthToPixels(padding.top, "y") * scale;
          bottom = lengthToPixels(padding.bottom, "y") * scale;
          left = beforeRect.x + beforeRect.width - instanceRect.x;
          right = instanceRect.x + instanceRect.width - afterRect.x;
          cursor = "ew-resize";
          rotate = "rotate(90deg)";
        } else {
          left = lengthToPixels(padding.left, "x") * scale;
          right = lengthToPixels(padding.right, "x") * scale;
          top = beforeRect.y + beforeRect.height - instanceRect.y;
          bottom = instanceRect.y + instanceRect.height - afterRect.y;
          cursor = "ns-resize";
          rotate = "rotate(0deg)";
        }

        container.style.setProperty("top", `${top}px`);
        container.style.setProperty("left", `${left}px`);
        container.style.setProperty("right", `${right}px`);
        container.style.setProperty("bottom", `${bottom}px`);
        _handle.style.setProperty(
          "--elementa-gap-handle-handle-cursor",
          cursor,
        );
        _handle.style.setProperty(
          "--elementa-gap-handle-handle-rotate",
          rotate,
        );
      },
    );
    return () => shapeSubscription.unsubscribe();
  }, [editor, before, after]);

  const handleGapStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = before.interfaceRect;
    if (!rect) return;

    const mouseInteraction = new MouseInteraction();
    mouseInteraction.on("start", (e) => {
      editor.setFlag("gapping", true);

      const style = handle.style;
      const initialGap = {
        x: handle.style.resolvedPropertyValue("gap-x") ?? 0,
        y: handle.style.resolvedPropertyValue("gap-x") ?? 0,
      };
      const direction =
        constantOf(style.resolvedPropertyValue("flex-direction") as any) ??
        "row";

      const deltaSubscription = combineLatestOrEmpty([
        mouseInteraction.deltaPosition$,
        mouseInteraction.ctrlKey$,
        mouseInteraction.altKey$,
      ]).subscribe(([delta, individual, symetrical]) => {
        let deltaGapValue = 0;

        if (direction === "row") {
          deltaGapValue = delta.x / editor.stager.viewport.scale;
        } else {
          deltaGapValue = delta.y / editor.stager.viewport.scale;
        }

        let newGap = {
          x: _.clamp(
            lengthToPixels(initialGap.x, "x") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER,
          ),
          y: _.clamp(
            lengthToPixels(initialGap.y, "y") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER,
          ),
        };

        // rounded
        style.setProperty("gap-x", Math.round(newGap.x ?? 0));
        style.setProperty("gap-y", Math.round(newGap.y ?? 0));
      });

      mouseInteraction.on("stop", () => {
        deltaSubscription.unsubscribe();
        mouseInteraction.dispose();

        setTimeout(() => {
          editor.setFlag("gapping", false);
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
      ref={containerRef}
      className="elementa-gap-handle"
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        ref={handleRef}
        className="elementa-gap-handle-handle"
        draggable
        onDragStart={handleGapStart}
        style={{
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
