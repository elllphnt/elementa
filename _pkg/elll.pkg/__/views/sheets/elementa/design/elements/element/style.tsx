import {
  BaseControlType,
  elllIcons16,
  FullControlEntry,
  useAction,
} from "@repo/components";
import { ElementInstance } from "@repo/elementa";
import { EditorOwnControlType } from "../../../../../../components/controls/control_map";
import { BorderControl } from "../../../../../../components/controls/datatypes/border/border";
import { InstanceStyleControlEntry } from "../../../../../../components/controls/infrastructure/style/instance_style";
import { useElementStyles } from "../../../../../../hooks/elementa/element";
import { useElementPropertyState } from "../../../../../../hooks/elementa/style";

export function ElementStyleControlSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const styles = useElementStyles(instances);

  const [showBackground, setShowBackground] = useElementPropertyState([
    "style",
    "background",
  ]);
  const [showBorder, setShowBorder] = useElementPropertyState([
    "style",
    "border",
  ]);
  const [showOpacity, setShowOpacity] = useElementPropertyState([
    "style",
    "opacity",
  ]);
  const [showVisibility, setShowVisibility] = useElementPropertyState([
    "style",
    "visibility",
  ]);
  const [showCursor, setShowCursor] = useElementPropertyState([
    "style",
    "cursor",
  ]);

  useAction(
    {
      index: 0,
      title: "Background",
      active: !!showBackground,
      icon: elllIcons16.containerFilled,
      handler: () => {
        setShowBackground(!showBackground);
      },
    },
    [showBackground, setShowBackground],
  );

  useAction(
    {
      index: 1,
      title: "Border",
      active: !!showBorder,
      icon: elllIcons16.border,
      handler: () => {
        setShowBorder(!showBorder);
      },
    },
    [showBorder, setShowBorder],
  );

  useAction(
    {
      index: 2,
      title: "Opacity",
      active: !!showOpacity,
      icon: elllIcons16.opacity,
      handler: () => {
        setShowOpacity(!showOpacity);
      },
    },
    [showOpacity, setShowOpacity],
  );

  useAction(
    {
      index: 3,
      title: "Visibility",
      active: !!showVisibility,
      icon: elllIcons16.visibility,
      handler: () => {
        setShowVisibility(!showVisibility);
      },
    },
    [showVisibility, setShowVisibility],
  );

  useAction(
    {
      index: 4,
      title: "Cursor",
      active: !!showCursor,
      icon: elllIcons16.toolSelect,
      handler: () => {
        setShowCursor(!showCursor);
      },
    },
    [showCursor, setShowCursor],
  );

  return (
    <>
      {showBackground && (
        <InstanceStyleControlEntry
          property="background"
          name="Background"
          styles={styles}
          control={EditorOwnControlType.Fill}
        />
      )}

      {showBorder && (
        <FullControlEntry label="Border">
          <BorderControl styles={styles as any} />
        </FullControlEntry>
      )}

      {showOpacity && (
        <InstanceStyleControlEntry
          property="opacity"
          name="Opacity"
          styles={styles}
          control={BaseControlType.Slider}
          controlSettings={{
            min: 0,
            max: 1,
            step: 0.05,
            suffix: "%",
            scale: 100,
          }}
        />
      )}

      {showVisibility && (
        <InstanceStyleControlEntry
          property="visibility"
          name="Visibility"
          styles={styles}
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              { label: "Visible", value: "visible" },
              { label: "Hidden", value: "hidden" },
            ],
          }}
        />
      )}

      {showCursor && (
        <InstanceStyleControlEntry
          property="cursor"
          name="Cursor"
          styles={styles}
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              { label: "Default", value: "default" },
              { label: "Pointer", value: "pointer" },
              { label: "Text", value: "text" },
              { label: "Move", value: "move" },
              { label: "Not Allowed", value: "not-allowed" },
              { label: "Help", value: "help" },
              { label: "Progress", value: "progress" },
              { label: "Wait", value: "wait" },
              { label: "Crosshair", value: "crosshair" },
            ],
          }}
        />
      )}
    </>
  );
}
