import { useEffect, useMemo, useRef } from "react";
import { map } from "rxjs";
import { useShell } from "~/src/hooks/shell";
import { DragDropManager } from "~/src/models/drag_drop_manager";
import { useObservable } from "@repo/utils";

export function useDrag(
  { getData }: { getData: () => Record<string, any> },
  dependencies: any[] = [],
) {
  const shell = useShell();
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
      event.stopPropagation();

      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;

      const data = getData();
      for (const key in data) {
        dataTransfer.setData(key, data[key]);
        dataTransfer.effectAllowed = "all";
      }

      shell.dragDropManager.setDragData(data);
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
    onDrop,
    canDrop = () => true,
    accept,
  }: {
    accept?: string[];
    canDrop?: (data: Record<string, any>) => boolean;
    onDrop?: (data: Record<string, any>, files?: FileList) => void;
  },
  dependencies: any[] = [],
) {
  const ref = useRef<HTMLElement | undefined>(undefined);
  const shell = useShell();
  const dragDropManager = shell.dragDropManager;

  const [_isDropTarget$, _isDropTarget] = useMemo(() => {
    const isDropTarget$ = dragDropManager.dropTarget$.pipe(
      map((target) => ref.current && target === ref.current),
    );
    const isDropTarget =
      ref.current && dragDropManager.dropTarget === ref.current;

    return [isDropTarget$, isDropTarget];
  }, [dragDropManager]);

  const [_containsDropTarget$, _containsDropTarget] = useMemo(() => {
    const containsDropTarget$ = dragDropManager.dropTarget$.pipe(
      map((target) => target && ref.current?.contains(target)),
    );
    const containsDropTarget =
      dragDropManager.dropTarget &&
      ref.current?.contains(dragDropManager.dropTarget);

    return [containsDropTarget$, containsDropTarget];
  }, [dragDropManager]);

  const isDropTarget = useObservable(_isDropTarget$, _isDropTarget);
  const containsDropTarget = useObservable(
    _containsDropTarget$,
    _containsDropTarget,
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleDragEnter = (event: DragEvent) => {
      const types = event.dataTransfer?.types ?? [];
      const acceptedTypes = accept ?? [];
      const data = dragDropManager.dragData ?? {};

      if (
        event.dataTransfer &&
        acceptedTypes.some((type) => types.includes(type)) &&
        canDrop(data)
      ) {
        event.preventDefault();
        event.stopPropagation();
        dragDropManager.setDropTarget(event.currentTarget as HTMLElement);
        event.dataTransfer.dropEffect = "move";
      }
    };
    const handleDragOver = (event: DragEvent) => {
      const types = event.dataTransfer?.types ?? [];
      const acceptedTypes = accept ?? [];
      const data = dragDropManager.dragData ?? {};

      if (
        event.dataTransfer &&
        acceptedTypes.some((type) => types.includes(type)) &&
        canDrop(data)
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";
      }
    };

    const handleDrop = (event: DragEvent) => {
      const types = event.dataTransfer?.types ?? [];
      const acceptedTypes = accept ?? [];

      const data: Record<string, any> = dragDropManager.dragData ?? {};
      for (const key of event.dataTransfer?.types ?? []) {
        data[key] = event.dataTransfer?.getData(key);
      }
      const files = event.dataTransfer?.files;

      if (acceptedTypes.some((type) => types.includes(type)) && canDrop(data)) {
        event.preventDefault();
        event.stopPropagation();
        onDrop?.(data, files);
      }

      dragDropManager.setDropTarget(undefined);
      dragDropManager.setDragData(undefined);
    };

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("drop", handleDrop);
    element.addEventListener("dragleave", handleDragLeave);
    element.addEventListener("dragover", handleDragOver);

    return () => {
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("drop", handleDrop);
      element.removeEventListener("dragleave", handleDragLeave);
      element.removeEventListener("dragover", handleDragOver);
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

export function useDragDropObserver(dragDropManager: DragDropManager) {
  useEffect(() => {
    const handleDragEnter = () => {
      dragDropManager.setDropTarget(undefined);
    };
    const handleDragEnd = () => {
      dragDropManager.setDropTarget(undefined);
      dragDropManager.setDragData(undefined);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);
}
