import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  Icon,
  lengthUnits,
  mixed,
  percentUnits,
  RowControlContainer,
  useAction,
} from "@repo/components";
import { ElementInstance } from "@repo/elementa";
import { InstanceStyleControlEntry } from "../../../../../../components/controls/infrastructure/style/instance_style";
import { useElementStyles } from "../../../../../../hooks/elementa/element";
import {
  useElementPropertyState,
  useStylesCommonPropertyValue,
} from "../../../../../../hooks/elementa/style";

function EdgeControl({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);
  const [_mode, setMode] = useElementPropertyState(["position", "mode"]);
  const mode = _mode === mixed ? "edges" : (_mode ?? "edges");

  useAction(
    {
      title: "Inset",
      icon: elllIcons16.inset,
      handler: () => {
        setMode("inset");
      },
      active: mode === "inset",
    },
    [mode],
  );
  useAction(
    {
      title: "Edges",
      icon: elllIcons16.edges,
      handler: () => {
        setMode("edges");
      },
      active: mode === "edges",
    },
    [mode],
  );

  return (
    <>
      {mode === "inset" ? (
        <>
          <RowControlContainer justify="space-between">
            <InstanceStyleControlEntry
              icon={<Icon name={elllIcons16.inset} />}
              name="Inset"
              styles={styles}
              control={BaseControlType.Dimension}
              properties={["top", "bottom", "left", "right"]}
              controlSettings={{
                units: [...lengthUnits, ...percentUnits],
                defaultUnit: "px",
              }}
            />
          </RowControlContainer>
        </>
      ) : (
        <>
          <RowControlContainer>
            <InstanceStyleControlEntry
              variant={ControlEntryVariant.Mini}
              icon={<Icon name={elllIcons16.top} />}
              property="top"
              name="Top"
              styles={styles}
              control={BaseControlType.Dimension}
              controlSettings={{
                units: [...lengthUnits, ...percentUnits],
                defaultUnit: "px",
              }}
            />
            <InstanceStyleControlEntry
              variant={ControlEntryVariant.Mini}
              icon={<Icon name={elllIcons16.right} />}
              property="right"
              name="Right"
              styles={styles}
              control={BaseControlType.Dimension}
              controlSettings={{
                units: [...lengthUnits, ...percentUnits],
                defaultUnit: "px",
              }}
            />
          </RowControlContainer>

          <RowControlContainer>
            <InstanceStyleControlEntry
              variant={ControlEntryVariant.Mini}
              icon={<Icon name={elllIcons16.left} />}
              property="left"
              name="Left"
              styles={styles}
              control={BaseControlType.Dimension}
              controlSettings={{
                units: [...lengthUnits, ...percentUnits],
                defaultUnit: "px",
              }}
            />
            <InstanceStyleControlEntry
              variant={ControlEntryVariant.Mini}
              icon={<Icon name={elllIcons16.bottom} />}
              property="bottom"
              name="Bottom"
              styles={styles}
              control={BaseControlType.Dimension}
              controlSettings={{
                units: [...lengthUnits, ...percentUnits],
                defaultUnit: "px",
              }}
            />
          </RowControlContainer>

          <InstanceStyleControlEntry
            property="z-index"
            name="Z-Index"
            styles={styles}
            control={BaseControlType.Number}
          />
        </>
      )}
    </>
  );
}

export function ElementPositionControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);
  const position = useStylesCommonPropertyValue(styles as any, "position");

  const showEdges =
    position === "absolute" ||
    position === "fixed" ||
    position === "sticky" ||
    position === "relative";

  return (
    <>
      <InstanceStyleControlEntry
        property="position"
        name="Position"
        styles={styles}
        control={BaseControlType.Select}
        controlSettings={{
          options: [
            { label: "Static", value: "static" },
            { label: "Relative", value: "relative" },
            { label: "Absolute", value: "absolute" },
            { label: "Fixed", value: "fixed" },
            { label: "Sticky", value: "sticky" },
          ],
          placeholder: "Static",
        }}
      />

      {showEdges ? <EdgeControl instances={instances} /> : <></>}
    </>
  );
}
