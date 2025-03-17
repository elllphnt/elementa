import { useObservable } from "@repo/utils";
import cx from "classnames";
import { Inspector } from "react-inspector";
import { ElementaBaseEditorState } from "~/src/editors/elementa/elementa";

function LogItem({ data }: { data: any }) {
  switch (typeof data) {
    case "string":
      return <span>{data}</span>;
    case "object":
      return <Inspector table={false} data={data} />;
    default:
      return <span>{String(data)}</span>;
  }
}

function LogEntry({ log }: { log: { type: string; content: string[] } }) {
  return (
    <div
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      }}
      className={cx("el-font-mono el-px-2 el-py-1 el-text-sm el-border-b", {
        "el-bg-red/30": log.type === "error",
        "el-bg-yellow/30": log.type === "warn",
        "el-bg-blue/30": log.type === "info",
      })}
    >
      {log.content.map((data, i) => (
        <LogItem key={i} data={data} />
      ))}
    </div>
  );
}

export function ElementaLogViewer({
  editor,
}: {
  editor: ElementaBaseEditorState<any>;
}): JSX.Element {
  const logs = useObservable(editor.logs$, editor.logs);

  return (
    <div>
      {logs.map((log, i) => (
        <LogEntry key={i} log={log} />
      ))}
    </div>
  );
}
