import { useEffect, useRef } from "react";
import { ElementaBaseEditorState } from "~/src/editors/elementa/elementa";

export function useElementaRenderer({
  editor,
}: {
  editor: ElementaBaseEditorState<any>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    editor.mount(container);
    return () => {
      editor.unmount();
    };
  }, [editor]);

  return ref;
}

export function ElementaRenderer({
  editor,
}: {
  editor: ElementaBaseEditorState<any>;
}): JSX.Element {
  const ref = useElementaRenderer({ editor });

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
      }}
      ref={ref}
    />
  );
}
