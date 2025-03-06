import { ViewComponent } from "@repo/components";
import { useShell } from "~/src/hooks/shell";
import { useObservable } from "@repo/utils";

export function WorkspaceModalContainer(): JSX.Element {
  const shell = useShell();
  const modal = useObservable(
    shell.modalManager.modal$("workspace"),
    shell.modalManager.modal("workspace"),
  );

  if (!modal) {
    return <></>;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        if (modal.closeOnBackdropClick) {
          shell.hideModal(modal.key);
        }
      }}
    >
      <div
        className="el-bg-bg el-rounded-lg el-shadow-lg el-border"
        style={{
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ViewComponent key={modal.key} id={modal.viewId} props={modal.props} />
      </div>
    </div>
  );
}

export default WorkspaceModalContainer;
