import { useShell } from "~/src/hooks/shell";
import { Toast } from "~/src/models/toast_manager";
import { useObservable } from "@repo/utils";

function ToastView({ toast }: { toast: Toast }) {
  return (
    <div
      className="el-bg-bg-200 el-px-3 el-py-1.5 el-overflow-y-auto el-flex el-items-center"
      style={{
        minHeight: 32,
        borderRadius: 16,
        maxWidth: 300,
        userSelect: "none",
      }}
    >
      {toast.message}
    </div>
  );
}

export function ToastContainer(): JSX.Element {
  const shell = useShell();
  const toasts = useObservable(
    shell.toastManager.toasts$,
    shell.toastManager.toasts,
  );

  return (
    <div
      className="el-absolute el-bottom-3 el-left-3"
      style={{
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {toasts.map((toast) => (
        <ToastView key={toast.key} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;
