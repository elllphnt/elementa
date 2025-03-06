import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { editors } from "~/src/editors/_editors";
import { useElll } from "~/src/hooks/elll/elll";

export function StyleAssetsView(): JSX.Element {
  const elll = useElll();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-1"
    >
      <TreeEntry
        nested
        container
        icon={<Icon name={elllIcons16.font} />}
        onClick={() => {
          elll.editorManager.openEditor(editors.utilitySheet);
        }}
      >
        Typefaces
      </TreeEntry>
      <TreeEntry
        nested
        container
        icon={<Icon name={elllIcons16.addFolder} />}
        onClick={() => {
          elll.editorManager.openEditor(editors.utilitySheet);
        }}
      >
        Keyframes
      </TreeEntry>
    </ScrollArea>
  );
}
