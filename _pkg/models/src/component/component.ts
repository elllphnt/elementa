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
import { CssStyleSheet } from "../css/_";
import { Project } from "../infrastructure/project/project";
import { attachDataInput, DataInput } from "./data_input";
import { attachFragment, Fragment } from "./fragment";
import { attachState, State } from "./states/_";
import { attachTemplate, Template } from "./template";

export type Component = ReactiveMap<ComponentData> & {
  project: Project;
  url: string;

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
  project: Project,
  {
    url,
  }: {
    url: string;
  }
): Component {
  const rxMap = attachReactiveMap<ComponentData>(ymap as y.Map<any>);
  const component = rxMap as Component;

  component.project = project;
  component.url = url;

  component.template = attachTemplate(
    getOrCreateYMap(rxMap, "template"),
    component
  );

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
    (ymap) => attachState(ymap, component)
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
  return component;
}

export function createComponent(
  project: Project,
  {
    url,
  }: {
    url: string;
  }
): Component {
  const ymap = new y.Map<any>();
  return attachComponent(ymap, project, { url });
}
