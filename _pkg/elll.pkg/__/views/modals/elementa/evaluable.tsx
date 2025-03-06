import { InlineExpressionControl, mixed, MixedType } from "@repo/components";
import { Evaluable, expressionOf } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

export function EvaluableMenu({
  value,
  value$,
  onChange,
}: {
  value?: Evaluable<any> | MixedType | undefined;
  value$?: Observable<Evaluable<any> | MixedType | undefined>;
  onChange?: (expression: Evaluable<any> | undefined) => void;
}) {
  const currentValue = useObservable(value$, value);

  return (
    <InlineExpressionControl
      value={currentValue === mixed ? currentValue : expressionOf(currentValue)}
      onChange={(value) => {
        onChange?.(value);
      }}
    />
  );
}
