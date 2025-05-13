import { Component, FileModelAdaptor } from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  ModelInstanceAdaptor,
} from "@elllphnt/elementa-runtime";
import { Outlet } from "@tanstack/react-router";
import {
  ComponentRenderable,
  InstanceRenderableAdaptor,
} from "../../renderables/_.js";

export function RouteViewComponent({
  view,
}: {
  view: InstanceRenderableAdaptor<
    ComponentInstance,
    ComponentRenderable,
    ModelInstanceAdaptor<
      Component,
      ComponentInstance,
      FileModelAdaptor<Component>
    >
  >;
}) {
  return (
    <>
      Route View: {view.instanceAdaptor.modelAdaptor.file.url}
      <br />
      <Outlet />
    </>
  );
}
