import {
  BaseControlType,
  ControlEntry,
  ControlEntryVariant,
  MiniControlEntry,
  RowControlContainer,
} from "@repo/components";
import _ from "lodash";
import { of, switchMap } from "rxjs";
import { InstanceStyleControlEntry } from "~/src/components/controls/infrastructure/style/instance_style";
import { useFramePageStyles } from "~/src/hooks/elementa/frame";
import { InstanceControl } from "../../../components/controls/infrastructure/instance/instance";
import { useInstancesCommonReactiveValue } from "../../../hooks/utils/reactivity";
import { FrameWidgetHandle } from "@repo/elementa-interactor";

function PageSizeEntry({
  frames,
  dimension,
  variant,
}: {
  dimension: "width" | "height";
  frames: FrameWidgetHandle[];
  variant?: ControlEntryVariant;
}) {
  const Dimension = _.capitalize(dimension) as Capitalize<typeof dimension>;

  const pageStyles = useFramePageStyles(
    frames.map((handle) => handle.renderable.instance),
  );

  return (
    <InstanceStyleControlEntry
      variant={variant}
      property={dimension}
      name={Dimension}
      styles={pageStyles}
      control={BaseControlType.Dimension}
      controlSettings={{
        defaultUnit: "px",
        units: [
          {
            unit: "px",
            label: "Pixel",
          },
        ],
      }}
    />
  );
}

function FrameSizeEntry({
  source,
  frames,
  dimension,
  variant,
}: {
  source: "frame" | "viewport" | "page";
  dimension: "width" | "height";
  frames: FrameWidgetHandle[];
  variant?: ControlEntryVariant;
}) {
  const Dimension = _.capitalize(dimension) as Capitalize<typeof dimension>;
  if (source === "frame") {
    return (
      <ControlEntry key="frame" label={Dimension} variant={variant}>
        <InstanceControl
          key="frame"
          instances={frames.map((handle) => handle.renderable.instance)}
          value$={(instance) => instance.entity[`${dimension}$`]}
          value={(instance) => instance.entity[dimension]}
          onChange={(instance, value) =>
            instance.entity[`set${Dimension}`](value)
          }
          control={BaseControlType.Number}
        />
      </ControlEntry>
    );
  } else if (source === "viewport") {
    return (
      <ControlEntry key="viewport" label={Dimension} variant={variant}>
        <InstanceControl
          key="viewport"
          variant={variant}
          instances={frames.map((handle) => handle.renderable.instance)}
          value$={(instance) =>
            instance.entity.viewport?.[`${dimension}$`] ?? of(undefined)
          }
          value={(instance) => instance.entity.viewport?.[dimension]}
          onChange={(instance, value) =>
            instance.entity.viewport?.update({ [dimension]: value })
          }
          control={BaseControlType.Number}
        />
      </ControlEntry>
    );
  } else {
    return (
      <PageSizeEntry
        key="page"
        variant={variant}
        dimension={dimension}
        frames={frames}
      />
    );
  }
}

export function FrameControl({
  selection,
}: {
  selection: FrameWidgetHandle[];
}): JSX.Element {
  const [overflow] = useInstancesCommonReactiveValue({
    instances: selection.map((handle) => handle.instance),
    value$: (instance) =>
      instance.entity.viewport$.pipe(
        switchMap((v) => v?.overflow$ ?? of(undefined)),
      ),
    value: (instance) => instance.entity.viewport?.overflow,
  });

  let widthSource: "frame" | "viewport" | "page" = "frame";
  let heightSource: "frame" | "viewport" | "page" = "frame";

  switch (overflow) {
    case "scroll-x":
      widthSource = "page";
      heightSource = "viewport";
      break;
    case "scroll-y":
      widthSource = "viewport";
      heightSource = "page";
      break;
    case "scroll-area":
      widthSource = "page";
      heightSource = "page";
      break;
  }

  return (
    <>
      <RowControlContainer>
        <MiniControlEntry label="X">
          <InstanceControl
            instances={selection.map((handle) => handle.renderable.instance)}
            value$={(instance) => instance.entity.x$}
            value={(instance) => instance.entity.x}
            onChange={(instance, value) => instance.entity.setX(value)}
            control={BaseControlType.Number}
          />
        </MiniControlEntry>
        <MiniControlEntry label="Y">
          <InstanceControl
            instances={selection.map((handle) => handle.renderable.instance)}
            value$={(instance) => instance.entity.y$}
            value={(instance) => instance.entity.y}
            onChange={(instance, value) => instance.entity.setY(value)}
            control={BaseControlType.Number}
          />
        </MiniControlEntry>
      </RowControlContainer>
      <RowControlContainer>
        <FrameSizeEntry
          key={`${widthSource}-width`}
          variant={ControlEntryVariant.Mini}
          source={widthSource}
          dimension="width"
          frames={selection}
        />
        <FrameSizeEntry
          key={`${heightSource}-height`}
          variant={ControlEntryVariant.Mini}
          source={heightSource}
          dimension="height"
          frames={selection}
        />
      </RowControlContainer>
    </>
  );
}
