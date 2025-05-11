import { useObservable } from "@elllphnt/elementa-react-utils";
import { AppComponent } from "@elllphnt/elementa-scene";
import { AppViewer } from "../../sub_viewers/app";

export function AppViewerComponent({ viewer }: { viewer: AppViewer }) {
  const renderable = useObservable(viewer.renderable$, viewer.renderable);
  if (!renderable) return <></>;
  return <AppComponent app={renderable} />;
}
