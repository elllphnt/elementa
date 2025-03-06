import { elllIcons16, Icon } from "@repo/components";
import { Handle } from "@repo/elementa";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import SheetContainer from "../../../components/sheet/sheet_container";
import { projectRootStyleSheets } from "../../sheets/elementa/project/root_style/_";

export const frameSheets = [
  projectRootStyleSheets.text,
  projectRootStyleSheets.body,
];

export function useProjectContextPanel() {
  return useWorkspaceState(["elementa", "project", "context", "menu"]);
}

function Header() {
  const [, setProjectContextPanel] = useProjectContextPanel();

  return (
    <div className="el-p-2 el-shrink-0 el-bg-pm/10 el-border-b el-border-pm/20 el-flex el-items-center el-gap-2">
      <button
        onClick={() => setProjectContextPanel(undefined)}
        className="el-h-6 el-w-6 el-rounded hover:el-bg-pm/20 el-flex el-items-center el-justify-center"
      >
        <Icon name={elllIcons16.chevron} className="el-rotate-180" />
      </button>
      <div className="el-flex el-gap-1 el-items-center">
        <div>Root Style</div>
      </div>
    </div>
  );
}

export function ProjectRootStyleContextPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  return (
    <div className="el-h-full el-w-full el-flex el-flex-col">
      <Header />
      <div className="el-grow el-overflow-hidden">
        <SheetContainer
          sheets={frameSheets.map((sheet) => ({
            key: sheet.id,
            viewId: sheet.id,
          }))}
          stateKey={[...stateKey, "sheets"]}
          props={{
            selection,
          }}
        />
      </div>
    </div>
  );
}
