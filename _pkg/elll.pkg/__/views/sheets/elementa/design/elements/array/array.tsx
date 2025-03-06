import {
  BaseControlType,
  FullControlEntry,
  mixed,
  resolveCommonValue,
  SelectControl,
} from "@repo/components";
import {
  ArrayElementInstance,
  ArrayModeValue,
  ElementInstance,
} from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import { EvaluableControlEntry } from "../../../../../../components/controls/infrastructure/evaluable/evaluable";

function ArrayArrayControlSheet({
  arrayElement,
}: {
  arrayElement: ArrayElementInstance;
}): JSX.Element {
  const mode = useObservable(
    arrayElement.entity.mode$,
    arrayElement.entity.mode,
  );

  return (
    <>
      <FullControlEntry label="Mode">
        <SelectControl
          value={mode}
          onChange={(value) => {
            arrayElement.entity.setMode(value as ArrayModeValue);
          }}
          settings={{
            options: [
              { label: "Static", value: "fixed" },
              { label: "Dynamic", value: "dynamic" },
            ],
          }}
        />
      </FullControlEntry>

      {mode === "fixed" ? (
        <EvaluableControlEntry
          value$={arrayElement.entity.length$}
          value={arrayElement.entity.length}
          onChange={(value) => {
            arrayElement.entity.setLength(value as any);
          }}
          label="Length"
          control={BaseControlType.Expression}
        />
      ) : (
        <></>
      )}

      {mode === "dynamic" ? (
        <EvaluableControlEntry
          value$={arrayElement.entity.dataset$}
          value={arrayElement.entity.dataset}
          onChange={(value) => {
            arrayElement.entity.setDataset(value);
          }}
          label="Dataset"
          control={BaseControlType.Expression}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export function ParentArrayControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const key = instances.map((s) => s.key).join(",");
  const parents = useManyObservables(
    instances.map((s) => s.parent$),
    instances.map((s) => s.parent),
    key,
  );

  const commonParent = resolveCommonValue(parents);

  if (commonParent && commonParent !== mixed) {
    return <ArrayArrayControlSheet arrayElement={commonParent} />;
  } else {
    return <></>;
  }
}

export function ArrayControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  if (instances.length === 1 && instances[0] instanceof ArrayElementInstance) {
    return <ArrayArrayControlSheet arrayElement={instances[0]} />;
  } else {
    return <ParentArrayControlSheet instances={instances} />;
  }
}
