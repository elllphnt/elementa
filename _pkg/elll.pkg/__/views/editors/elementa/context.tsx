import { elllIcons16 } from "@repo/components";
import {
  ElementaEditorContext,
  entityTypeMatch,
  entityTypes,
} from "@repo/elementa";
import { useObservable } from "@repo/utils";
import TabContainer from "../../../components/tab/tab_container";
import { ElementaEditorState } from "../../../editors/elementa/elementa";
import { contextViews } from "../../contexts/_";

export function ElementaEditorContextView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const elementaEditor = useObservable(
    editor.elementaEditor$,
    editor.elementaEditor,
  );
  const selection = useObservable(
    elementaEditor?.interactionManager.selection$,
    elementaEditor?.interactionManager.selection,
  );

  if (!elementaEditor) {
    return <></>;
  }

  return (
    <ElementaEditorContext.Provider value={elementaEditor}>
      <TabContainer
        stateKey={["elementa", "context"]}
        useIcon
        tabs={[
          {
            key: "copilot",
            viewId: contextViews.copilot.id,
            name: "Copilot",
            icon: elllIcons16.ai,
          },
          {
            key: "properties",
            viewId: contextViews.properties.id,
            name: "Properties",
            icon: elllIcons16.properties,
            enabled: (props) => !!props.selection?.length,
          },
          {
            key: "styles",
            viewId: contextViews.styles.id,
            name: "Styles",
            icon: elllIcons16.stylesheet,
            enabled: (props) =>
              !!props.selection?.length &&
              props.selection.every(
                (handle) =>
                  entityTypeMatch(handle.entity.type, entityTypes.element) ||
                  entityTypeMatch(
                    handle.entity.type,
                    entityTypes.widgets.frame,
                  ),
              ),
          },
          {
            key: "project",
            viewId: contextViews.project.id,
            name: "Project",
            icon: elllIcons16.directoryOpen,
            enabled: (props) => !props.selection?.length,
          },
          {
            key: "console",
            viewId: contextViews.console.id,
            name: "Console",
            icon: elllIcons16.console,
            enabled: (props) => !!props.selection?.length,
          },
        ]}
        props={{ selection }}
        hr
      />
    </ElementaEditorContext.Provider>
  );
}
