import { pairwiseOrEmpty, useObservable } from "@repo/utils";
import { useEffect, useRef } from "react";
import { PreviewEditorState } from "../../../editors/preview/preview";

export function PreviewEditorBoardView({
  editor,
}: {
  editor: PreviewEditorState;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const elementaEditor = useObservable(
    editor.elementaEditor$,
    editor.elementaEditor,
  );

  // add event listeners to elementa's window to repeat them
  // in the parent window
  useEffect(() => {
    if (!elementaEditor) return;
    const repeatMouseEvent = (e: MouseEvent) => {
      ref.current?.dispatchEvent(
        new MouseEvent(e.type, {
          ...e,
          bubbles: true,
        }),
      );
    };

    const subscription = elementaEditor.window$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          prev.removeEventListener("mousedown", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("mouseup", repeatMouseEvent, {
            capture: true,
          });
          prev.removeEventListener("click", repeatMouseEvent, {
            capture: true,
          });
        }
        if (next) {
          next.addEventListener("mousedown", repeatMouseEvent, {
            capture: true,
          });
          next.addEventListener("mouseup", repeatMouseEvent, { capture: true });
          next.addEventListener("click", repeatMouseEvent, { capture: true });
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [elementaEditor]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    editor.mount(container);
    return () => {
      editor.unmount();
    };
  }, [editor]);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
}
