import { useObservable } from "@elllphnt/elementa-utils";
import { memo } from "react";
import { RouteRenderable } from "~/src/renderables/_";
import ComponentComponent from "../component/component";

export const RouteComponent = memo(function ({
  route,
}: {
  route: RouteRenderable;
}): JSX.Element {
  const view = useObservable(route.view$, route.view);
  const path = useObservable(
    route.instance.route.path$,
    route.instance.route.path
  );

  const element = view ? <ComponentComponent component={view} /> : <>ok</>;
  return element;
});

export default RouteComponent;
