import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { useElll } from "~/src/hooks/elll/elll";
import { keys } from "~/src/libs/keys";
import { modalViews } from "../../modals/_";

export function AppView(): JSX.Element {
  const elll = useElll();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-4"
    >
      <div className="el-space-y-1" style={{ pointerEvents: "auto" }}>
        <label className="el-text-fg-400">
          Define what this project is about.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.ai} />}
          className="el-border"
          onClick={() => {
            elll.shell.showModal({
              affinity: "workspace",
              viewId: modalViews.brief.id,
              closeOnBackdropClick: true,
            });
          }}
        >
          Brief
        </TreeEntry>
      </div>

      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Design and structure the building blocks of this application.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.fileStylesheet} />}
          className="el-border"
          onClick={() => {
            elll.editorManager.openEditor(keys.editors.bleuprint);
          }}
        >
          Blueprint
        </TreeEntry>
      </div>

      {/*<div className="el-space-y-1">
        <label className="el-text-fg-400">
          Define and manage queries and actions consumed by the UI layer.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.script} />}
          className="el-border"
          onClick={() => {
            elll.editorManager.openEditor(programmingInterfaceEditor.id);
          }}
        >
          Programming Interface
        </TreeEntry>
      </div> */}
    </ScrollArea>
  );
}
