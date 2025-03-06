import { useShell } from "@repo/shell";
import { useRepository } from "~/src/hooks/backend/repository";
import { modalViews } from "../../modals/_";

export function DangerView(): JSX.Element {
  const shell = useShell();
  const repository = useRepository();

  const handleDeleteRepository = () => {
    if (!repository) {
      return;
    }
    shell.showModal({
      affinity: "workspace",
      viewId: modalViews.deleteProject.id,
      closeOnBackdropClick: true,
    });
  };

  return (
    <div className="el-h-full el-w-full el-p-2 el-flex el-flex-col el-space-y-4">
      <div className="el-space-y-2">
        <p className="el-text-fg-400">
          Delete this project to remove all data associated with it.
        </p>
        <button
          className="el-w-full el-bg-fg/5 el-text-fg hover:el-bg-red hover:el-text-red-ctr el-rounded el-px-2 el-py-1"
          onClick={handleDeleteRepository}
        >
          Delete this project
        </button>
      </div>
    </div>
  );
}
