import { useObservable } from "@elllphnt/elementa-react-utils";
import { viewerIds } from "../sub_viewers/_ids";
import { AppViewer } from "../sub_viewers/app";
import { ComponentViewer } from "../sub_viewers/component";
import { Viewer } from "../viewer";
import { AppViewerComponent } from "./sub_viewers/app";
import { ComponentViewerComponent } from "./sub_viewers/component";

export function ElementaViewerComponent({ viewer }: { viewer: Viewer }) {
  const subViewer = useObservable(
    viewer.activeSubViewer$,
    viewer.activeSubViewer
  );

  if (!subViewer) {
    return <>No Viewer</>;
  }

  switch (subViewer.id) {
    case viewerIds.app:
      return <AppViewerComponent viewer={subViewer as AppViewer} />;
    case viewerIds.component:
      return <ComponentViewerComponent viewer={subViewer as ComponentViewer} />;
    default:
      return <>Unknown Viewer {subViewer.id}</>;
  }
}

export default ElementaViewerComponent;
