import {
  ElementHandle,
  entityTypeMatch,
  entityTypes,
  FrameWidgetHandle,
  Handle,
} from "@repo/elementa";
import { ElementStylesPanel } from "./element/element";
import { FrameStylesPanel } from "./frame/frame";

export function StylesPanel({
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
      <FrameStylesPanel
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
      <ElementStylesPanel
        selection={selection as ElementHandle[]}
        stateKey={stateKey}
      />
    );
  } else {
    return <></>;
  }
}
