import { ElementaViewer } from "../elementa_viewer";

export function ComponentContent({
  componentUrl,
  viewer,
}: {
  viewer: ElementaViewer;
  componentUrl: string;
}) {
  return <div>Component: {componentUrl}</div>;
}
