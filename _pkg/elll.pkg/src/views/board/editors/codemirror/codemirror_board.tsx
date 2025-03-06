import { EditorView } from "@codemirror/view";
import { useObservable } from "@repo/utils";
import { useEffect, useMemo, useRef } from "react";
import { CodeMirrorEditorState } from "~/src/editors/codemirror/codemirror";

export function CodeMirrorBoardContent({
  codemirror,
}: {
  codemirror: EditorView;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    codemirror.dom.style.outline = "none";
    ref.current.innerHTML = "";
    ref.current.append(codemirror.dom);
  }, []);

  return (
    <div
      className="el-h-full el-w-full el-bg-bg-100"
      ref={ref}
      style={{
        pointerEvents: "auto",
      }}
    />
  );
}

export function CodeMirrorBoardView({
  editor,
}: {
  editor: CodeMirrorEditorState<any>;
}): JSX.Element {
  const codemirror = useObservable(editor.codemirror$, editor.codemirror);
  const key = useMemo(() => Math.random(), [codemirror]);

  if (!codemirror) {
    return <></>;
  } else {
    return <CodeMirrorBoardContent key={key} codemirror={codemirror} />;
  }
}
