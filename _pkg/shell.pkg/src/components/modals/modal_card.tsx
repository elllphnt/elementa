import { ViewComponent } from "@repo/components";
import { useRendererModal } from "./_hooks";

export function ModalCard(): JSX.Element {
  const { modal } = useRendererModal();

  return (
    <div
      style={{
        pointerEvents: "auto",
      }}
      className="el-bg-bg el-rounded-lg el-shadow-lg el-border"
    >
      <ViewComponent key={modal.key} id={modal.viewId} props={modal.props} />
    </div>
  );
}
