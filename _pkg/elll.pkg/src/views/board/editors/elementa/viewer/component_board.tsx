import { ElementaRenderer } from "~/src/components/modules/elementa/elementa_viewer";
import { ElementaEditorState } from "~/src/editors/elementa/editor";

export function ComponentViewerBoardView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <ElementaRenderer editor={editor} />
    </div>
  );
}
