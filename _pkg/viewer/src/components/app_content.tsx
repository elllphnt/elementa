import { AppComponent } from "@elllphnt/elementa-scene";
import { useObservable } from "@elllphnt/elementa-utils";
import { Viewer } from "../viewer";

export function AppContent({ viewer }: { viewer: Viewer }) {
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
