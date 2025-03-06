import { elllIcons16 } from "@repo/components";
import { ElementaInteractorContext } from "@repo/elementa-interactor";
import { useObservable } from "@repo/utils";
import TabContainer from "~/src/components/tab_container/tab_container";
import { ElementaEditorState } from "~/src/editors/elementa/editor";
import { outlineViews } from "../_";

export function ElementaEditorOutlineView({
  editor,
}: {
  editor: ElementaEditorState;
}): JSX.Element {
  const elementaInteractor = useObservable(
    editor.elementaInteractor$,
    editor.elementaInteractor,
  );

  if (!elementaInteractor) {
    return <></>;
  }

  return (
    <ElementaInteractorContext.Provider value={elementaInteractor}>
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
        ]}
        props={{
          interactor: elementaInteractor,
        }}
      />
    </ElementaInteractorContext.Provider>
  );
}
