import { elllIcons16, Icon, ScrollArea, TreeEntry } from "@repo/components";
import { useElll } from "~/src/hooks/elll/elll";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";

const sets = [
  "Layout",
  "FlexBox & Grid",
  "Spacing",
  "Sizing",
  "Typography",
  "Backgrounds",
  "Borders",
  "Effects",
  "Filters",
  "Tables",
  "Transitions & Animations",
  "Transforms",
  "Interactivity",
  "SVG",
  "Accessibility",
].sort();

function Utilities(): JSX.Element {
  const [open, setOpen] = useWorkspaceState("style_utilities_open", false);

  return (
    <div className="el-space-y-1">
      <div className="el-uppercase el-text-xs el-text-fg-300 el-px-2">
        Sheets
      </div>
      {open ? (
        sets.map((set) => (
          <TreeEntry key={set} icon={<Icon name={elllIcons16.stylesheet} />}>
            {set}
          </TreeEntry>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}

export function StyleUtilitiesView(): JSX.Element {
  const elll = useElll();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-1"
    >
      {sets.map((set) => (
        <TreeEntry key={set} icon={<Icon name={elllIcons16.stylesheet} />}>
          {set}
        </TreeEntry>
      ))}
    </ScrollArea>
  );
}
