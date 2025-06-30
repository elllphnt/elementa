import {
  AsyncResourceStatus,
  Component,
  FileModelAdaptor,
} from "@elllphnt/elementa-models";
import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  ComponentInstance,
  ModelInstanceAdaptor,
} from "@elllphnt/elementa-runtime";
import { InstanceRenderableAdaptor } from "../../renderables/adaptors/instance.js";
import { ComponentRenderable } from "../../renderables/component/component.js";
import ComponentComponent from "../component/component.js";

type RouteViewProps = {
  view: InstanceRenderableAdaptor<
    ComponentInstance,
    ComponentRenderable,
    ModelInstanceAdaptor<
      Component,
      ComponentInstance,
      FileModelAdaptor<"component">
    >
  >;
};

function PendingView({ view }: RouteViewProps) {
  const fileUrl = view.instanceAdaptor.modelAdaptor.file.url;

  return (
    <div className="system route-view pending">
      <div className="loader" />
      <p className="message">Loading component…</p>
      <code>{fileUrl}</code>
    </div>
  );
}

function MissingView({ view }: RouteViewProps) {
  const fileUrl = view.instanceAdaptor.modelAdaptor.file.url;
  return (
    <div className="system route-view missing">
      <h2>Missing View File</h2>
      <p>This route points to a file that does not exist.</p>
      <p>
        File URL: <code>{fileUrl}</code>
      </p>
    </div>
  );
}

function ErrorView({ view }: RouteViewProps) {
  const error =
    view.instanceAdaptor.modelAdaptor.error?.message ?? "Unknown error";
  return (
    <div className="system route-view error">
      <h2>Component Load Failed</h2>
      <p>We encountered an error while resolving this view component.</p>
      <pre>{error}</pre>
    </div>
  );
}

function ResolvedView({ view }: RouteViewProps) {
  const renderable = useObservable(view.renderable$, view.renderable);
  if (renderable) {
    return <ComponentComponent component={renderable} />;
  } else {
    return <>Fatal!</>;
  }
}

export function RouteViewComponent({ view }: RouteViewProps) {
  const status = useObservable(
    view.instanceAdaptor.modelAdaptor.status$,
    view.instanceAdaptor.modelAdaptor.status
  );

  switch (status) {
    case AsyncResourceStatus.Pending:
      return <PendingView view={view} />;
    case AsyncResourceStatus.Missing:
      return <MissingView view={view} />;
    case AsyncResourceStatus.Errored:
      return <ErrorView view={view} />;
    case AsyncResourceStatus.Resolved:
      return <ResolvedView view={view} />;
  }
}
