import { elllIcons16, Icon } from "@repo/components";

export function VariableIcon({ variable }: { variable: any }) {
  switch (variable.datatype) {
    default:
      return (
        <Icon name={elllIcons16.variable} color="#08f" onClick={() => {}} />
      );
  }
}
