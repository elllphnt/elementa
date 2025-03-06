import { Diagnostic, DiagnosticSeverity } from "@repo/elementa";
import cx from "classnames";

// Utility function to handle copy-to-clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert("Diagnostic details copied to clipboard!");
};

function DiagnosticCard({ diagnostic }: { diagnostic: Diagnostic }) {
  return (
    <div
      className={cx("el-rounded el-px-2 el-py-1", {
        "el-bg-yellow/10 el-text-yellow":
          diagnostic.severity === DiagnosticSeverity.Warning,
        "el-bg-red/10 el-text-red":
          diagnostic.severity === DiagnosticSeverity.Error,
      })}
    >
      {diagnostic.message}
    </div>
  );
}

export default DiagnosticCard;
