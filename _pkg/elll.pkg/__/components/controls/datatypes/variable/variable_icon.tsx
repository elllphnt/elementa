import { elllIcons16, Icon } from "@repo/components";
import { Variable } from "@repo/elementa";
import { useObservable } from "@repo/utils";

export function VariableIcon({ variable }: { variable: Variable }) {
  const type = useObservable(variable.datatype$, variable.datatype);

  switch (type) {
    default:
      return (
        <Icon name={elllIcons16.variable} color="#08f" onClick={() => {}} />
      );
  }
}
