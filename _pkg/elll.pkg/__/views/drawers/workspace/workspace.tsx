import { StatefulInput } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useWorkspace } from "~/src/hooks/backend/workspace";

export function WorkspaceView(): JSX.Element {
  const workspace = useWorkspace();
  const name = useObservable(workspace?.name$, workspace?.name);

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col el-py-3">
      <div className="el-px-3 el-space-y-2">
        <div className="el-space-y-1">
          <label className="el-text-sm el-text-fg-400">Workspace title</label>
          <StatefulInput
            value={name}
            placeholder="Untitled workspace"
            onChange={(e) => workspace?.setName(e.target.value)}
            className="el-outline-none el-border el-rounded el-h-7 el-py-1 el-px-1.5 el-w-full"
          />
        </div>
        <div className="el-space-y-1">
          <label className="el-text-sm el-text-fg-400">Workspace id</label>
          <p>
            <code className="el-text-fg-800 select-all">{workspace?.id}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
