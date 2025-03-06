import { ShellView } from "@repo/shell";
import { ElllContext } from "./_context";
import { Elll } from "./elll";

export function Editor({ elll }: { elll: Elll }) {
  return (
    <ElllContext.Provider value={elll}>
      <ShellView shell={elll.shell} />
    </ElllContext.Provider>
  );
}
