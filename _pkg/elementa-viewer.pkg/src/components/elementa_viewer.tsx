import { useObservable } from "@repo/utils";
import { ElementaViewer } from "../elementa_viewer";
import { AppContent } from "./app_content";
import { ComponentContent } from "./component_content";

export function ElementaViewerComponent({
  viewer,
}: {
  viewer: ElementaViewer;
}): JSX.Element {
  const address = useObservable(viewer.address$, viewer.address);

  if (!address) {
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

  if (address?.startsWith("elll:")) {
    return <ComponentContent viewer={viewer} componentUrl={address} />;
  } else if (address?.startsWith("app:")) {
    const path = address.replace("app:", "");
    return <AppContent viewer={viewer} path={path} />;
  }

  return <>{address}</>;
}

export default ElementaViewerComponent;
