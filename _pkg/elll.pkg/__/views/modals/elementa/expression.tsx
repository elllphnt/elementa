import { Expression } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

export function ExpressionMenu({
  value,
  value$,
  onChange,
}: {
  value?: Expression | MixedType | undefined;
  value$?: Observable<Expression | MixedType | undefined>;
  onChange?: (expression: Expression | undefined) => void;
}) {
  const currentValue = useObservable(value$, value);

  return (
    <ExpressionControl
      value={currentValue === mixed ? currentValue : currentValue}
      onChange={(value) => {
        onChange?.(value);
      }}
    />
  );
}
