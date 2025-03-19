import {
  ColumnControlContainer,
  ControlEntry,
  ControlMenuContainer,
  TextControl,
} from "@repo/components";
import { useRepository } from "~/src/hooks/backend/repository";

export function ProjectInfoModal() {
  const repository = useRepository();

  return (
    <ControlMenuContainer
      style={{
        width: 300,
      }}
    >
      <ColumnControlContainer noPadding>
        <ControlEntry label="Name">
          <TextControl
            value={repository?.name}
            value$={repository?.name$}
            onChange={(value) => repository?.setName(value || "")}
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
    </ControlMenuContainer>
  );
}
