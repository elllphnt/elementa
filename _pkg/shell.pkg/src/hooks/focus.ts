import { useObservable } from "@repo/utils";
import { useCallback, useEffect, useRef } from "react";
import { useShell } from "./shell";

export function useFocusNode(id: string) {
  const shell = useShell();
  const focusedNode = useObservable(shell.focusedNode$, shell.focusedNode);
  const ref = useRef<HTMLElement | null>(null);

  const focused = focusedNode === id;
  const setRef = useCallback((node: HTMLElement | null | undefined) => {
    ref.current = node ?? null;
  }, []);

  useEffect(() => {
    const handleCaptureMouseDown = (e: MouseEvent) => {
      if (shell.focusedNode !== id) {
        shell.setFocusedNode(id);
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      //e.stopPropagation();
    };

    ref.current?.addEventListener("mousedown", handleCaptureMouseDown, {
      capture: true,
    });
    ref.current?.addEventListener("mousedown", handleMouseDown);

    return () => {
      ref.current?.removeEventListener("mousedown", handleCaptureMouseDown, {
        capture: true,
      });
      ref.current?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [id, shell]);

  return {
    focused,
    setRef,
  };
}
