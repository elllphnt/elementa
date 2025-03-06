import { FullControlEntry } from "@repo/components";
import {
  ControllerWidgetHandle,
  SwitchTransformerControllerWidget,
} from "@repo/elementa";

export function SwitchControllerSheet({
  selection,
}: {
  selection: ControllerWidgetHandle<SwitchTransformerControllerWidget>[];
}): JSX.Element {
  return (
    <>
      <FullControlEntry label=""></FullControlEntry>
    </>
  );
}
