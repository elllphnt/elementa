import { elllIcons16 } from "@repo/components";
import { ElementaEditorContext } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import TabContainer from "~/src/components/tab_container/tab_container";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { outlineViews } from "../_";

export function ElementaEditorOutlineView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const elementaEditor = useObservable(
    editor.elementaEditor$,
    editor.elementaEditor,
  );

  if (!elementaEditor) {
    return <></>;
  }

  return (
    <ElementaEditorContext.Provider value={elementaEditor}>
      <TabContainer
        stateKey={["elementa", "outline"]}
        containerClassName="el-pt-1"
        useIcon
        tabs={[
          {
            key: "view",
            viewId: outlineViews.elementaView.id,
            name: "View",
            icon: elllIcons16.container,
          },
          {
            key: "states",
            viewId: outlineViews.elementaState.id,
            name: "States",
            icon: elllIcons16.state,
          },
          {
            key: "props",
            viewId: outlineViews.elementaProps.id,
            name: "Props",
            icon: elllIcons16.model,
          },
          // {
          //   key: "routines",
          //   viewId: outlineViews.elementaRoutines.id,
          //   name: "Routines",
          //   icon: elllIcons16.routine,
          // },
          // {
          //   key: "stylesheets",
          //   viewId: outlineViews.elementaStylesheets.id,
          //   name: "Stylesheets",
          //   icon: elllIcons16.stylesheet,
          // },
        ]}
        props={{
          editor: elementaEditor,
          elementa: elementaEditor.elementa,
        }}
      />
    </ElementaEditorContext.Provider>
  );
}
