import { useObservable } from "@elllphnt/elementa-utils";
import { Viewer } from "../viewer";
import { AppContent } from "./app_content";
import { ComponentContent } from "./component_content";

export function ElementaViewerComponent({
  viewer,
}: {
  viewer: Viewer;
}): JSX.Element {
  const url = useObservable(viewer.history.url$, viewer.history.url);

  if (!url) {
    return (
      <div
        style={{
          width: "calc(100 * var(--vw-unit))",
          height: "calc(100 * var(--vh-unit))",
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div>No address provided.</div>
        <div>Enter an address to get started.</div>
      </div>
    );
  }

  if (url?.startsWith("elll:")) {
    return <ComponentContent viewer={viewer} componentUrl={url} />;
  } else if (url?.startsWith("app:")) {
    return <AppContent viewer={viewer} />;
  }

  return <>{url}</>;
}

export default ElementaViewerComponent;
