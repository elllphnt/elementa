import {
  BaseControlType,
  elllIcons16,
  FullControlEntry,
  RowControlContainer,
  useAction,
} from "@repo/components";
import { FrameViewport, FrameWidgetHandle } from "@repo/elementa";
import { map } from "rxjs";
import { InstanceControl } from "../../../../../components/controls/infrastructure/instance/instance";
import { FramePresetControl } from "../../../../../components/controls/properties/frame_preset/frame_preset";
import { useInstancesCommonReactiveValue } from "../../../../../hooks/utils/reactivity";

export function FrameViewportSheet({
  selection,
}: {
  selection: FrameWidgetHandle[];
}): JSX.Element {
  const [hasViewport] = useInstancesCommonReactiveValue({
    instances: selection.map((handle) => handle.renderable.instance),
    value$: (instance) => instance.entity.viewport$.pipe(map(Boolean)),
    value: (instance) => Boolean(instance.entity.viewport),
  });

  useAction(
    {
      title: hasViewport ? "Remove Viewport" : "Add Viewport",
      icon: hasViewport ? elllIcons16.minus : elllIcons16.plus,
      handler: () => {
        selection.forEach((handle) => {
          if (hasViewport) {
            handle.renderable.instance.entity.setViewport(undefined);
          } else {
            const viewport = new FrameViewport({
              component: handle.entity.component,
            });
            handle.renderable.instance.entity.setViewport(viewport);
          }
        });
      },
    },
    [hasViewport],
  );

  if (!hasViewport) return <></>;

  return (
    <>
      <FullControlEntry label="Preset">
        <FramePresetControl
          instances={selection.map((handle) => handle.renderable.instance)}
        />
      </FullControlEntry>
      <FullControlEntry label="Width">
        <InstanceControl
          instances={selection.map((handle) => handle.renderable.instance)}
          value$={(instance) => instance.entity.viewportWidth$}
          value={(instance) => instance.entity.viewportWidth}
          onChange={(instance, value) =>
            instance.entity.setViewportWidth(value)
          }
          control={BaseControlType.Number}
        />
      </FullControlEntry>
      <FullControlEntry label="Height">
        <InstanceControl
          instances={selection.map((handle) => handle.renderable.instance)}
          value$={(instance) => instance.entity.viewportHeight$}
          value={(instance) => instance.entity.viewportHeight}
          onChange={(instance, value) =>
            instance.entity.setViewportHeight(value)
          }
          control={BaseControlType.Number}
        />
      </FullControlEntry>
      <RowControlContainer>
        <FullControlEntry label="Scroll">
          <InstanceControl
            instances={selection.map((handle) => handle.renderable.instance)}
            value$={(instance) => instance.entity.overflow$}
            value={(instance) => instance.entity.overflow}
            onChange={(instance, value) =>
              instance.entity.setOverflow(value as any)
            }
            controlSettings={{
              options: [
                { label: "Vertical", value: "scroll-y" },
                { label: "Horizontal", value: "scroll-x" },
                { label: "Area", value: "scroll-area" },
              ],
            }}
            control={BaseControlType.Select}
          />
        </FullControlEntry>
      </RowControlContainer>
    </>
  );
}
