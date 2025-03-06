import { useShell } from "@repo/shell";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { modalViews } from "../../modals/_";

export function DangerView(): JSX.Element {
  const shell = useShell();
  const workspace = useWorkspace();

  const handleDeleteWorkspace = () => {
    if (!workspace) {
      return;
    }
    shell.showModal({
      affinity: "workspace",
      viewId: modalViews.deleteWorkspace.id,
      closeOnBackdropClick: true,
    });
  };

  return (
    <div className="el-h-full el-w-full el-p-3 el-flex el-flex-col el-space-y-2">
      <div className="el-space-y-2">
        <p className="el-text-fg-400">
          Delete this workspace to remove all data associated with it.
        </p>
        <button
          className="el-w-full el-bg-fg/5 el-text-fg hover:el-bg-red hover:el-text-red-ctr el-rounded el-px-2 el-py-1"
          onClick={handleDeleteWorkspace}
        >
          Delete this workspace
        </button>
      </div>
    </div>
  );
}
