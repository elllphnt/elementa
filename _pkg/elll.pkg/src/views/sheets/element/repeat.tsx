import { ElementRepeatData } from "@elllphnt/elll-element";
import {
  BaseControlType,
  elllIcons16,
  ExpressionControl,
  FullControlEntry,
  resolveCommonValue,
  SwitchControl,
  useAction,
} from "@repo/components";
import { ElementHandle } from "@repo/elementa-interactor";
import { useManyObservables } from "@repo/utils";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { EvaluableControlEntry } from "~/src/components/ui/controls/_uncertain/evaluable/evaluable";

function FixedRepeatedControls({
  count,
  onChange,
}: {
  count: any;
  onChange: ({}: Partial<ElementRepeatData>) => void;
}) {
  return (
    <>
      <EvaluableControlEntry
        label="Count"
        control={elllControlTypes.Number}
        value={count}
        onChange={(v) => onChange({ count: v })}
      />
    </>
  );
}

function DynamicRepeatedControls({
  dataset,
  onChange,
}: {
  dataset: any;
  onChange: ({}: Partial<ElementRepeatData>) => void;
}) {
  return (
    <>
      <FullControlEntry label="Dataset">
        <ExpressionControl
          value={dataset}
          onChange={(d) => onChange({ dataset: d })}
        />
      </FullControlEntry>
    </>
  );
}

export function RepeatControlSheet({
  selection: handles,
}: {
  selection: ElementHandle[];
}): JSX.Element {
  const key = handles.map((h) => h.entity.key).join(".");
  const repeats = useManyObservables(
    handles.map((h) => h.entity.repeat$),
    handles.map((h) => h.entity.repeat),
    key,
  );
  const allRepeat = repeats.every(Boolean);
  const mode = resolveCommonValue(repeats.map((r) => r?.mode));

  function updateRepeats(data: Partial<ElementRepeatData> | undefined) {
    handles.forEach((h) => {
      if (data == undefined) {
        h.entity.setRepeat(undefined);
      } else {
        h.entity.setRepeat({
          ...h.entity.repeat,
          ...data,
        });
      }
    });
  }

  useAction(
    {
      title: allRepeat ? "Remove repeat" : "Add repeat",
      icon: allRepeat ? elllIcons16.minus : elllIcons16.plus,
      handler: () => {
        if (allRepeat) {
          updateRepeats(undefined);
        } else {
          updateRepeats({ mode: "fixed", count: 3 });
        }
      },
    },
    [allRepeat, key],
  );

  if (!allRepeat) {
    return <></>;
  }
  let controls = <></>;

  if (mode === "fixed") {
    const count = resolveCommonValue(repeats.map((r) => r?.count));
    controls = <FixedRepeatedControls count={count} onChange={updateRepeats} />;
  } else if (mode === "dynamic") {
    const dataset = resolveCommonValue(repeats.map((r) => r?.dataset));
    controls = (
      <DynamicRepeatedControls dataset={dataset} onChange={updateRepeats} />
    );
  }

  return (
    <>
      <FullControlEntry label="Mode">
        <SwitchControl
          value={mode}
          onChange={(mode) => updateRepeats({ mode: mode as any })}
          settings={{
            options: [
              {
                label: "Fixed",
                value: "fixed",
              },
              {
                label: "Dynamic",
                value: "dynamic",
              },
            ],
          }}
        />
      </FullControlEntry>
      {controls}
    </>
  );
}
