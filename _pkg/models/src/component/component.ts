import { ComponentData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveList,
  ReactiveMap,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { DataInputModel, withDataInputBehavior } from "./data_input";
import { FragmentModel, withFragmentBehavior } from "./fragment";
import { StateModel } from "./states/_";
import { createState } from "./states/_create";
import { TemplateModel, withTemplateBehavior } from "./template";

export type Component = ReactiveMap<ComponentData> & {
  project: Project;

  template: TemplateModel;
  editorStates: y.Map<y.Map<any>>;

  props: ReactiveList<DataInputModel>;
  fragments: ReactiveList<FragmentModel>;
  states: ReactiveList<StateModel>;

  name: string;
  name$: Observable<string>;

  fragment(id: string): FragmentModel | undefined;
  fragment$(id: string): Observable<FragmentModel | undefined>;

  getEditorState(key: string): y.Map<any>;
};

export function withComponentBehavior(
  ymap: y.Map<any>,
  project: Project
): Component {
  const rxMap = attachReactiveMap<ComponentData>(ymap as y.Map<any>);
  const component = rxMap as Component;

  component.project = project;

  component.template = withTemplateBehavior(
    getOrCreateYMap(rxMap, "template"),
    component
  );

  component.editorStates = getOrCreateYMap(rxMap, "editors");

  component.props = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "props"),
    withDataInputBehavior,
    (ymap) => withDataInputBehavior(ymap, component)
  );

  component.fragments = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "fragments"),
    withFragmentBehavior,
    (ymap) => withFragmentBehavior(ymap, component)
  );

  component.states = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "states"),
    createState,
    (ymap) => createState(ymap, component)
  );

  setModelFields(component, ["name"]);

  const _fragmentsById$ = new BehaviorSubject<Record<string, FragmentModel>>(
    {}
  );
  const fragmentSub = component.fragments.observable$.subscribe((fragments) => {
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

  const baseDispose = component.dispose.bind(component);
  component.dispose = () => {
    component.props.dispose();
    component.fragments.dispose();
    component.states.dispose();
    _fragmentsById$.complete();
    fragmentSub.unsubscribe();
    if (baseDispose) baseDispose();
  };

  return component;
}

export function createComponentModel(project: Project): Component {
  const ymap = new y.Map<any>();
  return withComponentBehavior(ymap, project);
}
