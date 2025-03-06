import {
  elllIcons16,
  Icon,
  ScrollArea,
  TextAreaControl,
  TextControl,
  TreeEntry,
} from "@repo/components";
import { blueprintEditor } from "~/src/editors/blueprint";
import { specEditor } from "~/src/editors/spec";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { useElll } from "~/src/hooks/elll/elll";

export function ServicesView(): JSX.Element {
  const elll = useElll();
  const workspace = useWorkspace();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-4"
    >
      <div className="el-space-y-1">
        <label className="el-text-fg-400">Title</label>
        <TextControl
          value={workspace?.name}
          value$={workspace?.name$}
          onChange={(value) => workspace?.setName(value || "")}
        />
      </div>
      <div className="el-space-y-1">
        <label className="el-text-fg-400">Description</label>
        <TextAreaControl
          settings={{
            minRows: 2,
            maxRows: 10,
          }}
        />
      </div>
      <div className="el-space-y-1">
        <label className="el-text-fg-400">
          Edit and organize the list of features in this project.
        </label>
        <TreeEntry
          icon={<Icon name={elllIcons16.ai} />}
          className="el-border"
          onClick={() => {
            elll.editorManager.openEditor(specEditor.id);
          }}
        >
          Spec
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
    </ScrollArea>
  );
}
