import { BaseControlType, FullControlEntry } from "@repo/components";
import {
  ControllerWidgetHandle,
  RepeatTransformer,
  RepeatTransformerControllerWidget,
} from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { ValueSetControl } from "../../../../../components/controls/infrastructure/value_set/value_set";

export function RepeatControllerSheet({
  selection,
}: {
  selection: ControllerWidgetHandle<RepeatTransformerControllerWidget>[];
}): JSX.Element {
  const transformers = useManyObservables(
    selection.map((handle) => handle.entity.target$),
    selection.map((handle) => handle.entity.target),
    selection.map((h) => h.key).join("."),
  ).filter((t) => t !== undefined) as RepeatTransformer[];

  return (
    <>
      <FullControlEntry label="Count">
        <ValueSetControl
          items={transformers}
          value$={(t) => t.count$}
          value={(t) => t.count}
          onChange={(t, count) => t.setCount(count as number)}
          control={BaseControlType.Number}
          vKey={transformers}
        />
      </FullControlEntry>
    </>
  );
}
