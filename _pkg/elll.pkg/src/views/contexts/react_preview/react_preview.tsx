import { ScrollArea } from "@repo/components";
import { Component, Project } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { useMemo } from "react";
import { Observable, of } from "rxjs";
import { ElementaLogViewer } from "~/src/components/elementa_viewer/elementa_log_viewer";
import { ElementaRenderer } from "~/src/components/elementa_viewer/elementa_viewer";
import { ElementaViewerState } from "~/src/editors/elementa/viewer";
import { ReactEditorState } from "~/src/editors/monaco/react";
import { useElll } from "~/src/hooks/elll/elll";
import { useElllProject } from "~/src/hooks/project/project";
import { keys } from "~/src/libs/keys";
import { ReactModel } from "~/src/models/react";

class ReactViewerComponent extends Component {
  readonly model: ReactModel;
  get url(): string {
    return this.model.url;
  }
  get name(): string {
    return this.model.url;
  }
  get name$(): Observable<string> {
    return of(this.model.url);
  }
  get loaded$(): Observable<boolean> {
    return this.model.content?.loaded$ ?? of(false);
  }
  get loaded(): boolean {
    return this.model.content?.loaded ?? false;
  }

  constructor({ model, project }: { model: ReactModel; project: Project }) {
    super({ project });
    this.model = model;
  }
}

function useReactViewer() {
  const elll = useElll();
  return useMemo(() => {
    let viewer = elll.config<ElementaViewerState>(
      keys.configs.editors.react.viewer,
    );
    if (!viewer) {
      viewer = new ElementaViewerState({ shell: elll.shell });
      elll.setConfig(keys.configs.editors.react.viewer, viewer);
    }
    return viewer;
  }, [elll]);
}

function useViewerComponent(model: ReactModel) {
  const project = useElllProject();
  return useMemo(() => {
    let component = project.elll.config<ReactViewerComponent>(
      keys.configs.editors.react.viewerComponent,
    );
    if (!component) {
      component = new ReactViewerComponent({ model, project });
      project.elll.setConfig(
        keys.configs.editors.react.viewerComponent,
        component,
      );
    }

    // const element = component.createElement({
    //   type: entityTypes.elements.components.code,
    // }) as CodeComponentElement;
    // component.template.setContent([element]);

    // return [component, element] as const;
  }, [project]);
}

function Viewer({ model }: { model: ReactModel }) {
  const viewer = useReactViewer();
  const renderer = useObservable(
    viewer.elementaRenderer$,
    viewer.elementaRenderer,
    viewer.key,
  );
  // const [component, element] = useViewerComponent(model);

  // Load the component into the renderer
  // useLayoutEffect(() => {
  //   if (renderer && element) {
  //     renderer.elementa.loadComponent(component);
  //   }
  // }, [renderer, component]);

  // Set the component url on model change
  // useLayoutEffect(() => {
  //   element.setComponentUrl(model.url);
  // }, [model.url, element]);

  return <ElementaRenderer editor={viewer} />;
}

function LogViewer() {
  const viewer = useReactViewer();
  return (
    <ScrollArea scrollY>
      <ElementaLogViewer editor={viewer} />
    </ScrollArea>
  );
}

export function ReactPreview({ editor }: { editor: ReactEditorState }) {
  const model = useObservable(editor.model$, editor.model, editor.key) as
    | ReactModel
    | undefined;

  return (
    <div className="el-h-full el-w-full el-relative">
      <div style={{ height: "60%" }}>
        {model ? <Viewer model={model} /> : null}
      </div>
      <div style={{ height: "40%", pointerEvents: "auto" }}>
        <LogViewer />
      </div>
    </div>
  );
}
