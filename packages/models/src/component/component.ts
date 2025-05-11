import { ComponentData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  createEnhancedReactiveList,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveList,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../css/_.js";
import { Project } from "../infrastructure/project/project.js";
import { attachDataInput, DataInput } from "./data_input.js";
import { attachFragment, Fragment } from "./fragment.js";
import { attachState, State } from "./states/_.js";
import { createState } from "./states/_create.js";
import { attachTemplate, Template } from "./template.js";

export type Component = ReactiveMap<ComponentData> & {
  project: Project;

  template: Template;
  editorStates: y.Map<y.Map<any>>;

  props: ReactiveList<DataInput>;
  fragments: ReactiveList<Fragment>;
  states: ReactiveList<State>;

  name: string;
  name$: Observable<string>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;

  allStylesheets$: Observable<CssStyleSheet[]>;
  allStylesheets: CssStyleSheet[];

  getEditorState(key: string): y.Map<any>;
};

export function attachComponent(
  ymap: y.Map<any>,
  project: Project
): ymap is Component {
  if (!attachReactiveMap<ComponentData>(ymap as y.Map<any>)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const rxMap = ymap;
  const component = rxMap as Component;

  component.project = project;

  const template = getOrCreateYMap(rxMap, "template");
  attachTemplate(getOrCreateYMap(rxMap, "template"), component);
  component.template = template as Template;

  component.editorStates = getOrCreateYMap(rxMap, "editors");

  component.props = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "props"),
    attachDataInput,
    (ymap) => attachDataInput(ymap, component)
  );

  component.fragments = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "fragments"),
    attachFragment,
    (ymap) => attachFragment(ymap, component)
  );

  component.states = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(rxMap, "states"),
    attachState,
    (ymap) => createState(ymap, component)
  );

  setModelFields(component, ["name"]);

  const _fragmentsById$ = new BehaviorSubject<Record<string, Fragment>>({});
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

  setEnhancer(component, attachComponent);
  return true;
}

export function createComponent(project: Project): Component {
  const ymap = new y.Map<any>();
  if (!attachComponent(ymap, project)) {
    throw new Error("Failed to attach component to ymap");
  }
  return ymap;
}
