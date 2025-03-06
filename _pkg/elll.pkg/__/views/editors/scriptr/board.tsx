import { EditorSelection } from "@codemirror/state";
import { ScrollArea } from "@repo/components";
import { useEffect, useRef } from "react";
import { CodeEditorState } from "../../../editors/code/code";

export function ScriptrEditorBoardView({
  editor,
}: {
  editor: CodeEditorState;
}): JSX.Element {
  console.log("ScriptrEditorBoardView", { editor });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    editor.view.dom.style.outline = "none";
    ref.current.innerHTML = "";
    ref.current.append(editor.view.dom);
  }, []);

  return (
    <ScrollArea
      rootStyle={{
        pointerEvents: "auto",
      }}
      scrollY
      scrollX
    >
      <div
        ref={ref}
        style={{
          width: "fit-content",
          minWidth: "100%",
        }}
      />
      <div
        className="el-cursor-text"
        style={{
          height: "calc(100% - 24px)",
        }}
        onClick={() => {
          editor.view.focus();
          editor.view.dispatch({
            selection: EditorSelection.cursor(editor.view.state.doc.length),
          });
        }}
      />
    </ScrollArea>
  );
}
