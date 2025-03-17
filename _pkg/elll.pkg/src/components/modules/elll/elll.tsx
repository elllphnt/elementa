import { ShellView } from "@repo/shell";
import { ElllContext } from "~/src/contexts/elll";
import { IElll } from "~/src/types/elll";

export function ElllView({ elll }: { elll: IElll }) {
  return (
    <ElllContext.Provider value={elll}>
      <ShellView shell={elll.shell} />
    </ElllContext.Provider>
  );
}
