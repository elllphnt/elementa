import { ShellView } from "@repo/shell";
import { ElllContext } from "../../contexts/elll";
import { IElll } from "../../types/elll";

export function ElllView({ elll }: { elll: IElll }) {
  return (
    <ElllContext.Provider value={elll}>
      <ShellView shell={elll.shell} />
    </ElllContext.Provider>
  );
}
