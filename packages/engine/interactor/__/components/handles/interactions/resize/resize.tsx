import { Rect } from "@elllphnt/elementa-math-utils";
import { useCallback, useRef } from "react";
import { BoxResizeHandleType } from "~/_lib/interaction";
import { Handle } from "~/_types/_";
import { IResizableHandle } from "~/_types/handles/properties/resizable";
import { useElementaInteractor } from "~/hooks/elementa_interactor";
import {
  OnResizeEnd,
  OnResizeStart,
  OnResizeUpdate,
  RawResizeHandle,
  resolveResizeOrigin,
  resolveResizeScaleFactor,
} from "./raw.js";

export function ResizeHandle({ handles }: { handles: IResizableHandle[] }) {
  const elementa = useElementaInteractor();
  const handlesStartRectRef = useRef(Rect.nullRect());
  const handlesStartContentRectRef = useRef<Map<Handle, Rect>>(new Map());
  const handleRef = useRef<BoxResizeHandleType | undefined>(undefined);

  const handleResizeStart: OnResizeStart = useCallback(
    (handle: BoxResizeHandleType) => {
      const interfaceRects: Rect[] = [];

      for (const handle of handles) {
        const contentRect = handle.contentRect;
        const interfaceRect = handle.interfaceRect;
        if (!contentRect || !interfaceRect) continue;

        handlesStartContentRectRef.current.set(handle, contentRect);
        interfaceRects.push(interfaceRect);
      }

      handlesStartRectRef.current = Rect.union(interfaceRects);
      handleRef.current = handle;
      elementa.setFlag("resizing", true);
    },
    [handles]
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

      const contentOrigin = elementa.stage.viewport.windowToContent(
        elementa.interface.interactorToStager(
          elementa.interface.interfaceToWindow(resizeOrigin)
        )
      );

      handles.forEach((handle) => {
        const startContentRect = handlesStartContentRectRef.current.get(handle);
        if (!startContentRect) return;

        const newRect = startContentRect.scale(
          resizeScaleFactor,
          contentOrigin
        );

        handle.resize(newRect, {
          x: axis.x,
          y: axis.y,
        });
      });
    },
    [handles]
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
