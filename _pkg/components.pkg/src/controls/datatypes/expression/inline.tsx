import { isExpression } from "@elllphnt/elll-element";
import { map } from "rxjs";
import { ControlProps } from "../../_type";
import { ScriptControl } from "../script/script";

export function InlineExpressionControl({
  value,
  value$,
  onChange,
}: ControlProps<any, {}>) {
  return (
    <ScriptControl
      value={isExpression(value) ? value.__expression : undefined}
      value$={value$?.pipe(
        map((v) => (isExpression(v) ? v.__expression : undefined)),
      )}
      onChange={(script) => {
        if (script) {
          if (isExpression(value)) {
            onChange?.({
              ...value,
              __expression: script,
            });
          } else {
            onChange?.({
              __expression: script,
            });
          }
        } else {
          onChange?.(undefined);
        }
      }}
      settings={{
        placeholder: "Enter expression here.",
      }}
    />
  );
}
