import {
  ElementHandle,
  entityTypeMatch,
  entityTypes,
  FrameWidgetHandle,
  Handle,
} from "@repo/elementa";
import { ElementPropertiesPanel } from "./element/element";
import { FramePropertiesPanel } from "./frame";

export function PropertiesPanel({
  selection,
  stateKey,
}: {
  selection: Handle[];
  stateKey: string[];
}): JSX.Element {
  if (selection.length === 0) {
    return <></>;
  }
  if (
    selection.every((handle) =>
      entityTypeMatch(handle.entity.type, entityTypes.widgets.frame),
    )
  ) {
    return (
      <FramePropertiesPanel
        selection={selection as FrameWidgetHandle[]}
        stateKey={stateKey}
      />
    );
  } else if (
    selection.some((handle) =>
      entityTypeMatch(handle.entity.type, entityTypes.element),
    )
  ) {
    return (
      <ElementPropertiesPanel
        selection={selection as ElementHandle[]}
        stateKey={stateKey}
      />
    );
  } else {
    return <></>;
  }
}
