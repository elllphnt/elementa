import { AsyncResourceStatus, makeFileUrl } from "@elllphnt/elementa-core";
import { useObservable } from "@elllphnt/elementa-react-utils";

import {
  ComponentInstance,
  DefaultFragmentEnvironment,
  InMemoryModuleHost,
  ModuleManager,
  Runtime,
  StaticComponentInputResolver,
} from "@elllphnt/elementa-runtime";
import {
  ComponentComponent,
  ComponentRenderable,
  DomStyleSheetManager,
  Scene,
} from "@elllphnt/elementa-scene";
import React, { useMemo } from "react";
import { LibraryFile, LibraryInfrastructure } from "../infrastructure";
import "./ContentViewer.css";

interface ContentViewerProps {
  path: string;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ path }) => {
  const type = path?.split(".").pop();
  if (0 && type === "component") {
    return <ComponentViewer path={path} />;
  } else if (type) {
    return <CodeViewer path={path} />;
  } else {
    return (
      <div className="content-viewer">Select a file to view its content</div>
    );
  }
};

const infrastructure = new LibraryInfrastructure();
const scene = new Scene({
  stylesheetManager: new DomStyleSheetManager(),
});
const runtime = new Runtime({
  moduleManager: new ModuleManager({
    infrastructure,
    moduleHost: new InMemoryModuleHost(),
    externals: [],
  }),
});
const environment = new DefaultFragmentEnvironment({ runtime });

const ComponentViewer: React.FC<ContentViewerProps> = ({ path }) => {
  const url = makeFileUrl({
    projectId: "project",
    fileId: LibraryFile.pathToId(path),
  });
  const componentAdaptor = infrastructure.component(url);
  const component = useObservable(
    componentAdaptor.model$,
    componentAdaptor.model
  );
  const status = useObservable(
    componentAdaptor.status$,
    componentAdaptor.status
  );
  const renderable = useMemo(() => {
    const inputResolver = new StaticComponentInputResolver({ environment });
    return component
      ? new ComponentRenderable({
          instance: new ComponentInstance({
            model: component,
            inputResolver,
          }),
          scene,
        })
      : null;
  }, [component]);

  if (status === AsyncResourceStatus.Pending) {
    return <div className="content-viewer">Loading component...</div>;
  } else if (status === AsyncResourceStatus.Errored) {
    return <div className="content-viewer">Error loading component</div>;
  } else if (renderable) {
    return (
      <div className="content-viewer">
        <ComponentComponent component={renderable} />
      </div>
    );
  }

  return <div></div>;
};

const CodeViewer: React.FC<ContentViewerProps> = ({ path }) => {
  const url = makeFileUrl({
    projectId: "project",
    fileId: LibraryFile.pathToId(path),
  });
  const content = infrastructure.file(url).content;
  const text = useObservable(content.text$, content.text);
  const status = useObservable(content.status$, content.status);

  if (status === AsyncResourceStatus.Pending) {
    return <div className="content-viewer">Loading component...</div>;
  } else if (status === AsyncResourceStatus.Errored) {
    return <div className="content-viewer">Error loading component</div>;
  } else if (text !== undefined) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <pre>{text}</pre>
      </div>
    );
  }

  return <div></div>;
};

export default ContentViewer;
