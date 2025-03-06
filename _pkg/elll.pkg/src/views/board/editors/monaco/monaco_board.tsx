import { Monaco } from "@monaco-editor/loader";
import { useObservable } from "@repo/utils";
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { MonacoEditorState } from "~/src/editors/monaco/monaco";
import { useMonaco } from "~/src/libs/monaco";

export function MonacoBoardContent({
  monaco,
  model,
  state,
}: {
  monaco: Monaco;
  model: monaco.editor.ITextModel;
  state: MonacoEditorState<any>;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const editor = monaco.editor.create(ref.current, {
      theme: "vs-dark",
      automaticLayout: true,
      model,
      language: "typescript",
      scrollbar: {
        useShadows: false,
      },
    });

    editor.onDidBlurEditorWidget(() => {
      state.save();
    });

    return () => {
      editor.dispose();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    />
  );
}

export function MonacoBoardView({
  editor,
}: {
  editor: MonacoEditorState<any>;
}): JSX.Element {
  const monaco = useMonaco();
  const textModel = useObservable(editor.textModel$, editor.textModel);

  if (!monaco || !textModel) {
    return <></>;
  } else {
    return (
      <MonacoBoardContent state={editor} monaco={monaco} model={textModel} />
    );
  }
}
