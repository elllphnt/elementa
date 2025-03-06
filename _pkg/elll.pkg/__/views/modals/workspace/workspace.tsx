import {
  ColumnControlContainer,
  ControlEntry,
  TextControl,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { useElll } from "~/src/hooks/elll/elll";

export function WorkspaceInfoModal() {
  const elll = useElll();
  const workspace = useWorkspace();
  const workspaceName = useObservable(workspace?.name$, workspace?.name);

  return (
    <div
      className="el-h-full el-w-full el-space-y-4"
      style={{
        width: 300,
      }}
    >
      <ColumnControlContainer noPadding>
        <ControlEntry label="Name">
          <TextControl
            value={workspaceName}
            onChange={(value) => workspace?.setName(value ?? "")}
            settings={{
              placeholder: "Workspace Name",
            }}
          />
        </ControlEntry>
        {/* <button
          onClick={() => elll.host.closeWorkspace()}
          className="el-w-full el-bg-fg/5 el-text-fg hover:el-bg-fg/10 el-rounded el-px-2 el-py-1"
        >
          Close Workspace
        </button> */}
      </ColumnControlContainer>
    </div>
  );
}
