import { Expression } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { toHtml } from "hast-util-to-html";
import { Observable } from "rxjs";
import { parse } from "svg-parser";

export function VectorMenu({
  value,
  value$,
  onChange,
}: {
  value?: Expression | MixedType | undefined;
  value$?: Observable<Expression | MixedType | undefined>;
  onChange?: (expression: Expression | undefined) => void;
}) {
  const currentValue = useObservable(value$, value);

  let script = "";
  let placeholder = "";
  if (currentValue === undefined) {
    placeholder = "Enter an expression";
  } else if (currentValue === mixed) {
    placeholder =
      "Mixed expression values. Enter an expression to override the existing values.";
  } else {
    script = toHtml(currentValue as any);
  }

  return (
    <ScriptControl
      value={script}
      onChange={(script) => {
        if (script) {
          const data = parse(script);
          if (data.type === "root") {
            onChange?.(data as any);
          }
        } else {
          onChange?.(undefined);
        }
      }}
      settings={{
        placeholder,
      }}
    />
  );
}
