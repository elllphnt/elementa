import { FragmentComponent, RouterContext } from "@repo/elementa-renderer";
import { useObservable } from "@repo/utils";
import { ElementaViewer } from "../elementa_viewer";

export function ElementaViewerComponent({
  viewer,
}: {
  viewer: ElementaViewer;
}): JSX.Element {
  const template = useObservable(viewer.template$, viewer.template);

  if (!template) {
    return <></>;
  }

  return (
    <>
      <RouterContext.Provider value={viewer.router}>
        <FragmentComponent key={template.key} fragment={template} isolated />
      </RouterContext.Provider>
    </>
  );
}

export default ElementaViewerComponent;
