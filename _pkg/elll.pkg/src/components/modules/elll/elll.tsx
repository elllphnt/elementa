import { ShellView } from "@repo/shell";
import { ElllContext } from "~/src/contexts/elll";
import { IElll } from "~/src/types/elll";

export function ElllView({ elll }: { elll: IElll }) {
  return (
    <div
      className="elll"
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <ElllContext.Provider value={elll}>
        <ShellView shell={elll.shell} />
      </ElllContext.Provider>
    </div>
  );
}
