import { Viewer } from "../viewer";

export function ComponentContent({
  componentUrl,
  viewer,
}: {
  viewer: Viewer;
  componentUrl: string;
}) {
  return <div>Component: {componentUrl}</div>;
}
