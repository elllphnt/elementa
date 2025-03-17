import { FullControlEntry } from "@repo/components";
import { FrameWidgetHandle } from "@repo/elementa-interactor";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { ValueSetControlEntry } from "~/src/components/ui/controls/_uncertain/value_set/value_set";

export function FrameStyleControlSheet({
  selection,
}: {
  selection: FrameWidgetHandle[];
}): JSX.Element {
  return (
    <>
      <ValueSetControlEntry
        control={elllControlTypes.Color}
        label="Foreground"
        onRemove={() => {
          selection.forEach((handle) =>
            handle.renderable.instance.entity.setForegroundColor(undefined),
          );
        }}
        items={selection.map((handle) => handle.renderable.instance)}
        value$={(instance) => instance.entity.foregroundColor$}
        value={(instance) => instance.entity.foregroundColor}
        onChange={(instance, value) =>
          instance.entity.setForegroundColor(value)
        }
        vKey={selection.map((h) => h.key).join(",")}
      />
      <ValueSetControlEntry
        control={elllControlTypes.Color}
        label="Background"
        onRemove={() => {
          selection.forEach((handle) =>
            handle.renderable.instance.entity.setBackgroundColor(undefined),
          );
        }}
        items={selection.map((handle) => handle.renderable.instance)}
        value$={(instance) => instance.entity.backgroundColor$}
        value={(instance) => instance.entity.backgroundColor}
        onChange={(instance, value) =>
          instance.entity.setBackgroundColor(value)
        }
        vKey={selection.map((h) => h.key).join(",")}
      />
      <FullControlEntry label="Color scheme">
        {/* <InstanceControl
          control={BaseControlType.Switch}
          instances={selection.map((handle) => handle.renderable.instance)}
          value$={(instance) => instance.entity.colorScheme$}
          value={(instance) => instance.entity.colorScheme}
          onChange={(instance, value) => instance.entity.setColorScheme(value)}
          controlSettings={{
            options: [
              {
                value: undefined,
                label: "Light",
              },
              {
                value: "dark",
                label: "Dark",
              },
            ],
          }}
        /> */}
      </FullControlEntry>
    </>
  );
}
