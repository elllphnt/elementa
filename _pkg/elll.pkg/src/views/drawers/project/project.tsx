import { ScrollArea, TextControl } from "@repo/components";
import { CopyControl } from "~/src/components/ui/controls/_uncertain/copy/copy";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElll } from "~/src/hooks/elll/elll";
import { useElllProject } from "~/src/hooks/project/project";

export function ProjectView(): JSX.Element {
  const elll = useElll();
  const project = useElllProject();
  const repository = useRepository();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-4"
    >
      <div className="el-space-y-1">
        <label className="el-text-fg-400">Title</label>
        <TextControl
          value={repository?.name}
          value$={repository?.name$}
          onChange={(value) => repository?.setName(value || "")}
          settings={{
            placeholder: "Untitled",
          }}
        />
      </div>
      <div className="el-space-y-1">
        <label className="el-text el-text-fg-400">Repository ID</label>
        <CopyControl value={repository?.id ?? ""} className="el-font-mono" />
      </div>

      {/* <div className="el-space-y-1" style={{ pointerEvents: "auto" }}>
        <label className="el-text-fg-400">
          Edit the specification for this project.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.ai} />}
          className="el-border"
          onClick={() => {
            elll.shell.showModal({
              affinity: "workspace",
              viewId: modalViews.spec.id,
              closeOnBackdropClick: true,
            });
          }}
        >
          Specification
        </TreeEntry>
      </div>

      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Design and structure the UI components and interactions for this
          project.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.fileStylesheet} />}
          className="el-border"
          onClick={() => {
            elll.editorManager.openEditor(blueprintEditor.id);
          }}
        >
          Blueprint
        </TreeEntry>
      </div>

      <div className="el-space-y-1">
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
