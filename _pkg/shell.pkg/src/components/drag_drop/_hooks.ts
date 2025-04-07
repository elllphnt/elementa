import { useObservable } from "@repo/utils";
import { useEffect, useRef } from "react";
import { BehaviorSubject } from "rxjs";

const dropTarget$ = new BehaviorSubject<
  | [
      HTMLElement,
      ((event: DragEvent, data?: Record<string, any>) => void) | undefined,
    ]
  | undefined
>(undefined);
const dragData$ = new BehaviorSubject<Record<string, any> | undefined>(
  undefined,
);

export function useDrag(
  {
    getData,
    getLabel,
  }: { getData: () => Record<string, any>; getLabel?: () => string },
  dependencies: any[] = [],
) {
  const ref = useRef<HTMLElement | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.draggable = true;
  }, dependencies);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleDragStart = (event: DragEvent) => {
      if (event.target !== element) return;
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;

      const data = getData();
      dragData$.next(data);

      for (const key in data) {
        dataTransfer.setData(key, data[key]);
        dataTransfer.effectAllowed = "all";
      }

      const label = getLabel?.();
      if (label) {
        // create a label for the drag image
        const dragImage = document.createElement("div");
        dragImage.style.position = "absolute";
        dragImage.style.top = "-1000px";
        dragImage.style.left = "-1000px";
        dragImage.style.fontSize = "11px";
        dragImage.style.height = "16px";
        dragImage.style.padding = "2px 8px";
        dragImage.style.borderRadius = "16px";
        dragImage.style.display = "flex";
        dragImage.style.alignItems = "center";
        dragImage.style.justifyContent = "center";
        dragImage.className = "el-bg-pm el-text-pm-ctr";
        dragImage.innerText = label;
        document.body.appendChild(dragImage);
        dataTransfer.setDragImage(dragImage, 0, 16);
        setTimeout(() => {
          document.body.removeChild(dragImage);
        });
      }
    };

    element.addEventListener("dragstart", handleDragStart);

    return () => {
      element.removeEventListener("dragstart", handleDragStart);
    };
  }, dependencies);

  const setRef = (element: HTMLElement | null | undefined) => {
    ref.current = element ?? undefined;
  };

  return [setRef] as const;
}

export function useDrop(
  {
    acceptDrop = () => true,
    handleDrop: _handleDrop,
  }: {
    acceptDrop?: (
      event: DragEvent,
      data?: Record<string, any>,
    ) => boolean | "copy" | "link" | "move";
    handleDrop?: (event: DragEvent, data?: Record<string, any>) => void;
  },
  dependencies: any[] = [],
) {
  const ref = useRef<HTMLElement | undefined>(undefined);
  const [dropTarget] = useObservable(dropTarget$, dropTarget$.value) ?? [
    undefined,
    () => {},
  ];

  const isDropTarget = ref.current && dropTarget === ref.current;
  const containsDropTarget = dropTarget && ref.current?.contains(dropTarget);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleDragEnter = (event: DragEvent) => {
      if (!event.dataTransfer) return;

      const accept = acceptDrop?.(event, dragData$.value);
      if (accept) {
        event.preventDefault();
        event.stopPropagation();
        dropTarget$.next([element, _handleDrop]);

        if (typeof accept === "string") {
          event.dataTransfer.dropEffect = accept;
        } else {
          event.dataTransfer.dropEffect = "move";
        }
      }
    };
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer) return;
      const accept = acceptDrop?.(event, dragData$.value);
      if (accept) {
        event.preventDefault();
        event.stopPropagation();

        if (typeof accept === "string") {
          event.dataTransfer.dropEffect = accept;
        } else {
          event.dataTransfer.dropEffect = "move";
        }
      }
    };
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      _handleDrop?.(event, dragData$.value);
    };

    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("drop", handleDrop);

    return () => {
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("drop", handleDrop);
    };
  }, dependencies);

  const setRef = (element: HTMLElement | null | undefined) => {
    ref.current = element ?? undefined;
  };

  return [
    setRef,
    {
      isDropTarget,
      containsDropTarget,
    },
  ] as const;
}

export function useDragDropObserver() {
  useEffect(() => {
    const handleDragEnter = () => {
      dropTarget$.next(undefined);
    };
    const handleDragEnd = (event: DragEvent) => {
      const dropTarget = dropTarget$.value;
      if (dropTarget) {
        event.preventDefault();
        event.stopPropagation();
        const [, handleDrop] = dropTarget;
        handleDrop?.(event, dragData$.value);
      }
      dropTarget$.next(undefined);
      dragData$.next(undefined);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);
}
