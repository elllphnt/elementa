import { Rect } from "@repo/utils";
import { useCallback, useRef } from "react";
import { BoxResizeHandleType } from "~/src/_lib/interaction";
import { IResizableHandle } from "~/src/_types/handles/properties/resizable";
import { Handle } from "~/src/handles/handle";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";
import {
  OnResizeEnd,
  OnResizeStart,
  OnResizeUpdate,
  RawResizeHandle,
  resolveResizeOrigin,
  resolveResizeScaleFactor,
} from "./raw";
import { IHandle } from "~/src/_types/_";

export function ResizeHandle({ handles }: { handles: IResizableHandle[] }) {
  const elementa = useElementaInteractor();
  const handlesStartRectRef = useRef(Rect.nullRect());
  const handlesStartContentRectRef = useRef<Map<IHandle, Rect>>(new Map());
  const handleRef = useRef<BoxResizeHandleType | undefined>(undefined);

  const handleResizeStart: OnResizeStart = useCallback(
    (handle: BoxResizeHandleType) => {
      const viewportRects: Rect[] = [];

      for (const handle of handles) {
        const contentRect = handle.contentRect;
        const viewportRect = handle.interfaceRect;
        if (!contentRect || !viewportRect) continue;

        handlesStartContentRectRef.current.set(handle, contentRect);
        viewportRects.push(viewportRect);
      }

      handlesStartRectRef.current = Rect.union(viewportRects);
      handleRef.current = handle;
      elementa.setFlag("resizing", true);
    },
    [handles],
  );
  const handleResizeUpdate: OnResizeUpdate = useCallback(
    ({ axis, delta, proportional, symetrical }) => {
      const startRect = handlesStartRectRef.current;
      const handle = handleRef.current;
      let resizeOrigin = resolveResizeOrigin({
        startRect,
        symetrical,
        handle,
      });
      let resizeScaleFactor = resolveResizeScaleFactor({
        axis,
        delta,
        proportional,
        symetrical,
        handle,
        startRect,
      });

      const contentOrigin =
        elementa.stager.viewport.viewportToContent(resizeOrigin);

      handles.forEach((handle) => {
        const startContentRect = handlesStartContentRectRef.current.get(handle);
        if (!startContentRect) return;

        const newRect = startContentRect.scale(
          resizeScaleFactor,
          contentOrigin,
        );

        handle.resize(newRect, {
          x: axis.x,
          y: axis.y,
        });
      });
    },
    [handles],
  );
  const handleResizeEnd: OnResizeEnd = useCallback(() => {
    handleRef.current = undefined;
    setTimeout(() => {
      elementa.setFlag("resizing", false);
    });
  }, []);

  return (
    <RawResizeHandle
      onResizeStart={handleResizeStart}
      onResizeUpdate={handleResizeUpdate}
      onResizeEnd={handleResizeEnd}
    />
  );
}
