import { useObservable } from "@repo/utils";
import { ElementaViewer } from "../elementa_viewer";

export function AppContent({
  viewer,
}: {
  viewer: ElementaViewer;
}) {
  const project = useObservable(
    viewer.infrastructure.defaultProject$,
    viewer.infrastructure.defaultProject,
  );
  const app = project?.app;

  return <App>;
}
