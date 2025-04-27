import { useObservable } from "@elllphnt/elementa-utils";
import { memo } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppRenderable, ComponentRenderable } from "~/src/renderables/_";
import { ComponentComponent } from "../_";

const treeToRoute = function ({
  view,
  layout,
  id,
  path,
  parentId,
  layoutUrl,
  viewUrl,
}: {
  view: ComponentRenderable | undefined;
  layout: ComponentRenderable | undefined;
  id: string;
  path?: string | undefined;
  parentId?: string | undefined;
  layoutUrl?: string | undefined;
  viewUrl?: string | undefined;
}): JSX.Element {
  const element = view ? <ComponentComponent component={view} /> : undefined;
  if (path === "" || path === "") {
    return <Route key={id} index element={element} />;
  } else {
    return <Route key={id} path={path || "/"} element={element} />;
  }
};

export const AppComponent = memo(function ({
  app,
}: {
  app: AppRenderable;
}): JSX.Element {
  const tree = useObservable(app.tree$, app.tree);
  return (
    <BrowserRouter>
      <Routes>{tree.routes.map((route) => treeToRoute(route))}</Routes>
    </BrowserRouter>
  );
});

export default AppComponent;
