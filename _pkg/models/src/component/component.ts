import { ComponentData } from "@elllphnt/elementa-base";
import {
  Extendable,
  ReactiveListOf,
  attachReactiveMap,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { DataInputModel, withDataInputBehavior } from "./data_input";
import { FragmentModel, withFragmentBehavior } from "./fragment";
import { StateModel } from "./states/_";
import { createState } from "./states/_create";
import { TemplateModel, withTemplateBehavior } from "./template";

export type Component = ReturnType<typeof attachReactiveMap<ComponentData>> & {
  project: Project;

  template: TemplateModel;
  editorStates: y.Map<y.Map<any>>;

  props: ReactiveListOf<y.Map<any>, DataInputModel>;
  fragments: ReactiveListOf<y.Map<any>, FragmentModel>;
  states: ReactiveListOf<y.Map<any>, StateModel>;

  name: string;
  name$: ReturnType<typeof map>;

  fragment(id: string): FragmentModel | undefined;
  fragment$(id: string): ReturnType<typeof map>;

  getEditorState(key: string): y.Map<any>;
};

export function withComponentBehavior(
  ymap: y.Map<any>,
  project: Project
): Component {
  const component = attachReactiveMap<ComponentData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Component>;

  component.project = project;

  component.template = withTemplateBehavior(
    component.getOrCreateMap("template"),
    project.componentManager ? (component as any) : (component as any) // workaround to avoid cyclic
  );

  component.editorStates = component.getOrCreateMap("editors");

  component.props = new CRDTModelList(
    component.getOrCreateArray("props"),
    (ymap) => withDataInputBehavior(ymap, component)
  );

  component.fragments = new CRDTModelList(
    component.getOrCreateArray("fragments"),
    (ymap) => withFragmentBehavior(ymap, component)
  );

  component.states = new CRDTModelList(
    component.getOrCreateArray("states"),
    (ymap) => createState(ymap, component)
  );

  Object.defineProperty(component, "name", {
    get() {
      return component.value.name ?? "";
    },
  });

  component.name$ = component.observable$.pipe(
    map((v) => v.name ?? ""),
    distinctUntilChanged()
  );

  const _fragmentsById$ = new BehaviorSubject<Record<string, FragmentModel>>(
    {}
  );
  const fragmentSub = component.fragments.items$.subscribe((fragments) => {
    _fragmentsById$.next(
      Object.fromEntries(fragments.map((fragment) => [fragment.id, fragment]))
    );
  });

  component.fragment = (id: string) => {
    return _fragmentsById$.value[id];
  };

  component.fragment$ = (id: string) => {
    return _fragmentsById$.pipe(
      map((fragments) => fragments[id]),
      distinctUntilChanged()
    );
  };

  component.getEditorState = (key: string) => {
    let map = component.editorStates.get(key);
    if (!map || !(map instanceof y.Map)) {
      map = new y.Map();
      component.editorStates.set(key, map);
    }
    return map;
  };

  const baseDispose = (component as any).dispose?.bind(component);
  component.dispose = () => {
    component.props.dispose();
    component.fragments.dispose();
    component.states.dispose();
    _fragmentsById$.complete();
    fragmentSub.unsubscribe();
    if (baseDispose) baseDispose();
  };

  return component as Component;
}

/**
 * Create a new local Component
 */
export function createComponentModel(project: Project): Component {
  const ymap = new y.Map<any>();
  return withComponentBehavior(ymap, project);
}
