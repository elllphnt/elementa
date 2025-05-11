import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { Component } from "../../_interfaces/component/component.js";
import { attachDataInput, DataInput } from "./data_input.js";
import { attachFragment, Fragment } from "./fragment.js";
import { attachState, State } from "./states/_.js";
import { createState } from "./states/_create.js";
import { attachTemplate, Template } from "./template.js";

export function attachComponent(
  ymap: y.Map<any>,
  project: Project
): ymap is y.Map<any> & Component {
  assert(attachReactiveMap(ymap));
  const component = ymap;

  assert(setObjectProperty(component, "project", project));

  const templateYMap = getOrCreateYMap(ymap, "template");
  attachTemplate(templateYMap, component);
  assert(
    setObjectGetter(component, "template", () => templateYMap as Template)
  );

  const editorStatesYMap = getOrCreateYMap(ymap, "editors");
  assert(attachReactiveMap(editorStatesYMap));
  assert(
    setObjectGetter(
      component,
      "editorStates",
      () => editorStatesYMap as y.Map<y.Map<any>>
    )
  );

  const propsList = attachEnhancedReactiveList<DataInput>(
    getOrCreateYArray<y.Map<any>>(ymap, "props"),
    attachDataInput,
    (ymap) => attachDataInput(ymap, component)
  );
  assert(setObjectProperty(component, "props", propsList));

  const fragmentsList = attachEnhancedReactiveList<Fragment>(
    getOrCreateYArray<y.Map<any>>(ymap, "fragments"),
    attachFragment,
    (ymap) => attachFragment(ymap, component)
  );
  assert(setObjectProperty(component, "fragments", fragmentsList));

  const statesList = attachEnhancedReactiveList<State>(
    getOrCreateYArray<y.Map<any>>(ymap, "states"),
    attachState,
    (ymap) => createState(ymap, component)
  );
  assert(setObjectProperty(component, "states", statesList));

  const _fragmentsById$ = new BehaviorSubject<Record<string, Fragment>>({});
  const fragmentSub = fragmentsList.items$.subscribe((fragments) => {
    _fragmentsById$.next(
      Object.fromEntries(fragments.map((fragment) => [fragment.id, fragment]))
    );
  });

  assert(
    setObjectGetter(
      component,
      "fragment",
      () => (id: string) => _fragmentsById$.value[id]
    )
  );
  assert(
    setObjectProperty(component, "fragment$", (id: string) =>
      _fragmentsById$.pipe(
        map((fragments) => fragments[id]),
        distinctUntilChanged()
      )
    )
  );

  const _allStylesheets$ = new BehaviorSubject<CssStyleSheet[]>([]);
  assert(
    setObjectProperty(
      component,
      "allStylesheets$",
      _allStylesheets$.asObservable().pipe(distinctUntilChanged())
    )
  );
  assert(
    setObjectGetter(component, "allStylesheets", () => _allStylesheets$.value)
  );

  assert(
    setObjectGetter(component, "getEditorState", () => (key: string) => {
      let map = editorStatesYMap.get(key) as y.Map<any> | undefined;
      if (!map || !(map instanceof y.Map)) {
        map = new y.Map();
        editorStatesYMap.set(key, map);
      }
      return map;
    })
  );

  const originalDispose = component.dispose || (() => {});
  component.dispose = () => {
    propsList.dispose?.();
    fragmentsList.dispose?.();
    statesList.dispose?.();

    (templateYMap as unknown as { dispose?: () => void }).dispose?.();
    (
      editorStatesYMap as unknown as ReactiveMap<{ dispose?: () => void }>
    ).dispose?.();

    _fragmentsById$.complete();
    fragmentSub.unsubscribe();
    _allStylesheets$.complete();

    originalDispose();
  };

  return setEnhancer<ComponentCRDT>(component, attachComponent);
}

export function createComponent(project: Project): ComponentCRDT {
  const ymap = new y.Map<any>();
  attachComponent(ymap, project);
  return ymap as ComponentCRDT;
}
