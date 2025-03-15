import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { editors } from "~/src/editors/_editors";
import { useElll } from "~/src/hooks/elll/elll";
import { Typefaces } from "./typefaces";

export function StyleAssetsView(): JSX.Element {
  const elll = useElll();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-1"
    >
      <Typefaces />
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
