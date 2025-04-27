import { useObservable } from "@elllphnt/elementa-utils";
import { AppComponent } from "@repo/elementa-renderer";
import { ElementaViewer } from "../elementa_viewer";

export function AppContent({ viewer }: { viewer: ElementaViewer }) {
  const app = useObservable(viewer.app$, viewer.app);

  if (!app) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          fontSize: "2em",
        }}
      >
        No Active App
      </div>
    );
  }
  return <AppComponent app={app} />;
}
