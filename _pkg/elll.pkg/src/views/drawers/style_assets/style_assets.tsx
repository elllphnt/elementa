import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { useElll } from "~/src/hooks/elll/elll";
import { keys } from "~/src/libs/keys";
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
          elll.editorManager.openEditor(keys.editors.utilitySheet);
        }}
      >
        Keyframes
      </TreeEntry>
    </ScrollArea>
  );
}
