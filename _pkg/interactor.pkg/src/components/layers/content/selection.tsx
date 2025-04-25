import { combineLatestOrEmpty, Rect, useObservable } from "@repo/utils";
import { useEffect, useMemo, useRef } from "react";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { ICornerHandle as CornerHandleType } from "~/src/_types/handles/properties/corner";
import { IResizableHandle } from "~/src/_types/handles/properties/resizable";
import {
  ContainerElementHandle,
  ElementHandle,
  FrameWidgetHandle,
  handleProperties,
} from "~/src/handles/_";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";
import { SizeControl } from "../../handles/controls/size/size";
import { CornerHandle } from "../../handles/interactions/corner";
import { GapHandle } from "../../handles/interactions/gap/gap";
import {
  FramePaddingHandle,
  PaddingHandle,
} from "../../handles/interactions/padding";
import { ResizeHandle } from "../../handles/interactions/resize/resize";

export function SelectionDesignHandle() {
  const editor = useElementaInteractor();
  const htmlElement$ = useRef(
    new BehaviorSubject<HTMLElement | undefined>(undefined),
  );
  const viewportRect$ = useMemo(() => {
    return editor.interactionManager.selection$.pipe(
      switchMap((handles) =>
        combineLatestOrEmpty(
          handles.map((instance) => instance.interfaceRect$),
        ),
      ),
      map((rects) => Rect.union(rects.filter(Boolean) as Rect[])),
    );
  }, [editor]);
  const selection = useObservable(
    editor.interactionManager.selection$,
    editor.interactionManager.selection,
  );
  const selectionKey = selection.map((instance) => instance.key).join(".");

  useEffect(() => {
    const rectSubscription = combineLatestOrEmpty([
      htmlElement$.current,
      viewportRect$,
    ]).subscribe(([htmlElement, rect]) => {
      if (!htmlElement) return;

      if (!rect || (rect.width === 0 && rect.height === 0)) {
        htmlElement.style.display = "none";
      } else {
        htmlElement.style.display = "block";
        htmlElement.style.left = `${rect.x}px`;
        htmlElement.style.top = `${rect.y}px`;
        htmlElement.style.width = `${rect.width}px`;
        htmlElement.style.height = `${rect.height}px`;
      }
    });

    return () => {
      rectSubscription.unsubscribe();
    };
  }, []);

  const controls: JSX.Element[] = [];
  const handles: JSX.Element[] = [];

  const resizableHandles = selection.filter((handle) =>
    handle.property(handleProperties.canResize),
  ) as unknown as IResizableHandle[];

  if (resizableHandles.length === selection.length) {
    handles.push(
      <ResizeHandle key={selectionKey + "resize"} handles={resizableHandles} />,
    );
    controls.push(
      <SizeControl key={selectionKey + "size"} handles={resizableHandles} />,
    );
  }

  if (selection.length === 1) {
    const handle = selection[0];

    if (handle.property(handleProperties.hasCorner)) {
      handles.push(
        <CornerHandle
          key={selectionKey + "corner"}
          handle={handle as unknown as CornerHandleType}
        />,
      );
    }

    if (handle instanceof ElementHandle) {
      handles.push(
        <PaddingHandle key={selectionKey + "padding"} handle={handle} />,
      );
    }

    if (handle instanceof ContainerElementHandle) {
      handles.push(<GapHandle key={selectionKey + "gap"} handle={handle} />);
    }
    if (handle instanceof FrameWidgetHandle) {
      handles.push(
        <FramePaddingHandle key={selectionKey + "padding"} handle={handle} />,
      );
    }
  }

  if (!handles.length) return null;

  return (
    <div
      ref={(element) => htmlElement$.current.next(element ?? undefined)}
      className="elementa-selection"
    >
      <div className="elementa-selection-handles">{handles}</div>
      <div className="elementa-selection-controls">{controls}</div>
    </div>
  );
}

export function ContentSelectionLayer() {
  const editor = useElementaInteractor();
  const ready = useObservable(editor.stager.ready$, false);
  const moving = useObservable(editor.flag$("moving"), false);
  const dragging = useObservable(editor.flag$("dragging"), false);
  const editorMode = useObservable(editor.stager.mode$, editor.stager.mode);

  if (!ready || moving || dragging) return null;

  if (editorMode === "design") {
    return <SelectionDesignHandle />;
  } else {
    return <></>;
  }
}
