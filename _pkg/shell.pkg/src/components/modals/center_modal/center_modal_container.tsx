import { ViewComponent } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useShell } from "~/src/hooks/shell";

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
      className="fade-in el-bg-[#0002] dark:el-bg-[#0005]"
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
        className="el-bg-bg el-rounded-lg el-shadow-lg el-border fade-in-bottom"
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
