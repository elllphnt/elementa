import { BaseControlType, FullControlEntry } from "@repo/components";
import { FrameWidgetHandle } from "@repo/elementa";
import { InstanceControl } from "../../../../../components/controls/infrastructure/instance/instance";

export function FrameStyleControlSheet({
  selection,
}: {
  selection: FrameWidgetHandle[];
}): JSX.Element {
  return (
    <>
      <FullControlEntry label="Color scheme">
        <InstanceControl
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
        />
      </FullControlEntry>
    </>
  );
}
