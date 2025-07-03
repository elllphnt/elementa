import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { Rect } from "@elllphnt/elementa-math-utils";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX, useEffect, useMemo, useRef } from "react";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { CornerHandleType } from "~/_lib/interaction.js";
import { IResizableHandle } from "~/_types/handles/properties/resizable.js";
import { SizeControl } from "~/components/handles/controls/size/size.js";
import { CornerHandle } from "~/components/handles/interactions/corner.js";
import { ResizeHandle } from "~/components/handles/interactions/resize/resize.js";
import { handleProperties } from "~/handles/_libs/properties.js";
import { useElementaInteractor } from "~/hooks/elementa_interactor.js";

export function SelectionDesignHandle() {
  const editor = useElementaInteractor();
  const htmlElement$ = useRef(
    new BehaviorSubject<HTMLElement | undefined>(undefined)
  );
  const viewportRect$ = useMemo(() => {
    return editor.interactionManager.selection$.pipe(
      switchMap((handles) =>
        combineLatestOrEmpty(handles.map((instance) => instance.interfaceRect$))
      ),
      map((rects) => Rect.union(rects.filter(Boolean) as Rect[]))
    );
  }, [editor]);
  const selection = useObservable(
    editor.interactionManager.selection$,
    editor.interactionManager.selection
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
    handle.property(handleProperties.canResize)
  ) as unknown as IResizableHandle[];

  if (resizableHandles.length === selection.length) {
    handles.push(
      <ResizeHandle key={selectionKey + "resize"} handles={resizableHandles} />
    );
    controls.push(
      <SizeControl key={selectionKey + "size"} handles={resizableHandles} />
    );
  }

  if (selection.length === 1) {
    const handle = selection[0];

    if (handle.property(handleProperties.hasCorner)) {
      handles.push(
        <CornerHandle
          key={selectionKey + "corner"}
          handle={handle as unknown as CornerHandleType}
        />
      );
    }

    // if (handle instanceof ElementHandle) {
    //   handles.push(
    //     <PaddingHandle key={selectionKey + "padding"} handle={handle} />
    //   );
    // }

    // if (handle instanceof ContainerElementHandle) {
    //   handles.push(<GapHandle key={selectionKey + "gap"} handle={handle} />);
    // }
    // if (handle instanceof FrameWidgetHandle) {
    //   handles.push(
    //     <FramePaddingHandle key={selectionKey + "padding"} handle={handle} />
    //   );
    // }
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
  const moving = useObservable(editor.flag$("moving"), false);
  const dragging = useObservable(editor.flag$("dragging"), false);

  if (moving || dragging) return <>{JSON.stringify({ dragging, moving })}</>;

  return <SelectionDesignHandle />;
}
