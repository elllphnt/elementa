import { BaseControlType } from "@repo/components";
import { VectorElementInstance } from "@repo/elementa";
import { EvaluableControlEntry } from "../../../../../../components/controls/infrastructure/evaluable/evaluable";
import { useInstancesCommonReactivePair } from "../../../../../../hooks/utils/reactivity";

export function VectorControlSheet({
  instances,
}: {
  instances: VectorElementInstance[];
}): JSX.Element {
  const [_value$, _value] = useInstancesCommonReactivePair({
    instances,
    value$: (i) => i.entity.content$,
    value: (i) => i.entity.content,
  });

  return (
    <>
      <EvaluableControlEntry
        label="Source"
        value$={_value$}
        value={_value}
        onChange={(value) => {
          instances.forEach((instance) => {
            instance.entity.setContent(value);
          });
        }}
        control={BaseControlType.Expression}
      />
    </>
  );
}
