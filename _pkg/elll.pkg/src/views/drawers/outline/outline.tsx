import { ViewComponent } from "@repo/components";
import { useActiveEditor, useShell } from "@repo/shell";

function NoOutlineView(): JSX.Element {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        textAlign: "center",
      }}
      className="el-text-fg-500"
    >
      The current editor does not have an outline view.
    </div>
  );
}

export function OutlineView(): JSX.Element {
  const shell = useShell();
  const activeEditor = useActiveEditor();
  const editor = activeEditor ? shell.editor(activeEditor.editorId) : undefined;
  const activeOutlineViewId = editor?.views.outline;
  let content = <NoOutlineView />;

  if (activeOutlineViewId && activeEditor) {
    content = (
      <ViewComponent
        key={activeOutlineViewId}
        id={activeOutlineViewId}
        props={{ editor: activeEditor }}
      />
    );
  }

  return content;
}
