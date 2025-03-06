import { useObservable } from "@repo/utils";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";
import { EdgeComponent } from "../../handles/edge";

function ConnectionEdge() {
  const editor = useElementaInteractor();
  const connectionEdge = useObservable(
    editor.interactionManager.connection$,
    editor.interactionManager.connection,
  );

  if (!connectionEdge) {
    return <></>;
  }

  return (
    <EdgeComponent key={connectionEdge.key} edge={connectionEdge} active />
  );
}

function EdgeList() {
  // const editor = useElementaEditor();
  // const canvas = useObservable(editor.widgetHandles$, editor.widgetHandles);
  // const edges = (useObservable(canvas?.edges$, canvas?.edges) ??
  //   []) as Connection[];

  return (
    <>
      <ConnectionEdge />
      {/* {edges.map((edge) => (
        <EdgeComponent key={edge.key} edge={edge} />
      ))} */}
    </>
  );
}

export function EdgeLayer(): JSX.Element {
  return <EdgeList />;
}
