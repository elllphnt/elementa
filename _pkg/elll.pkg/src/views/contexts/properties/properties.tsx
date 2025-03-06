import { entityTypeMatch, entityTypes } from "@elllphnt/elll-element";
import {
  ElementHandle,
  EntityHandle,
  FrameWidgetHandle,
} from "@repo/elementa-interactor";
import { useObservable } from "@repo/utils";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { FramePropertiesPanel } from "./frame";
import { ElementPropertiesPanel } from "./element";

function PropertiesPanelContent({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const interactor = useObservable(
    editor.elementaInteractor$,
    editor.elementaInteractor,
  );
  const selection =
    useObservable(
      interactor?.interactionManager.selection$,
      interactor?.interactionManager.selection,
    ) ?? [];
  const stateKey = ["editors", "component", "context", "properties"];

  if (selection.length === 0) {
    return <></>;
  }
  if (
    selection.every(
      (handle) =>
        handle instanceof EntityHandle &&
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
    selection.every(
      (handle) =>
        handle instanceof EntityHandle &&
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

export function PropertiesPanel({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    >
      <PropertiesPanelContent editor={editor} />
    </div>
  );
}
