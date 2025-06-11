import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  getOrCreateYArray,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Project } from "../../../../infrastructure/_.js";
import { Component } from "../../../_interfaces/component/component.js";
import { DataInput } from "../../../_interfaces/component/data_input.js";
import { Fragment } from "../../../_interfaces/component/fragment/fragment.js";
import { State } from "../../../_interfaces/component/states/_.js";
import { Template } from "../../_interfaces/component/template.js";
import { attachDataInput } from "./data_input.js";
import { attachFragment } from "./fragment.js";
import { attachState } from "./states/_.js";
import { createState } from "./states/_create.js";
import { attachTemplate } from "./template.js";

export function attachComponent(
  component: y.Map<any>,
  project: Project
): component is y.Map<any> & Component {
  assert(attachReactiveMap(component));

  // Set project reference
  assert(setObjectProperty(component, "project", project));

  // Setup stage editor
  const editorsYMap = getOrCreateYMap(component, "editors");
  const stage = getOrCreateYMap(editorsYMap, "stage");
  assert(attachReactiveMap(stage));
  assert(setObjectGetter(component, "stage", () => stage as any));

  // Setup preview editor
  const preview = getOrCreateYMap(editorsYMap, "preview");
  assert(attachReactiveMap(preview));
  assert(setObjectGetter(component, "preview", () => preview as any));

  // Setup template
  const templateYMap = getOrCreateYMap(component, "template");
  assert(attachTemplate(templateYMap, component as unknown as Component));
  assert(
    setObjectGetter(
      component,
      "template",
      () => templateYMap as unknown as Template
    )
  );

  // Setup props
  const propsList = getOrCreateYArray<y.Map<any>>(component, "props");
  assert(
    attachEnhancedReactiveList<DataInput>(propsList, attachDataInput, (prop) =>
      attachDataInput(prop, component as unknown as Component)
    )
  );
  assert(setObjectProperty(component, "props$", propsList.items$));
  assert(setObjectGetter(component, "props", () => propsList.items));

  // Setup fragments
  const fragmentsList = getOrCreateYArray<y.Map<any>>(component, "fragments");
  assert(
    attachEnhancedReactiveList<Fragment>(
      fragmentsList,
      attachFragment,
      (fragment) => attachFragment(fragment, component as unknown as Component)
    )
  );
  assert(setObjectProperty(component, "fragments$", fragmentsList.items$));
  assert(setObjectGetter(component, "fragments", () => fragmentsList.items));

  // Setup states
  const statesList = getOrCreateYArray<y.Map<any>>(component, "states");
  assert(
    attachEnhancedReactiveList<State>(statesList, attachState, (state) =>
      createState(state, component as unknown as Component)
    )
  );
  assert(setObjectProperty(component, "states$", statesList.items$));
  assert(setObjectGetter(component, "states", () => statesList.items));

  // Setup component name
  const _nameSubject = new BehaviorSubject<string>(
    (component.get("name") as string) || ""
  );
  component.observe((event) => {
    if (event.path.length === 1 && event.path[0] === "name") {
      _nameSubject.next((component.get("name") as string) || "");
    }
  });

  assert(
    setObjectProperty(
      component,
      "name$",
      _nameSubject.asObservable().pipe(distinctUntilChanged())
    )
  );
  assert(
    setObjectGetter(
      component,
      "name",
      () => (component.get("name") as string) || ""
    )
  );

  // Setup fragment lookup by ID
  const _fragmentsById$ = new BehaviorSubject<Record<string, Fragment>>({});
  const fragmentByIdSub = fragmentsList.items$.subscribe((fragments) => {
    _fragmentsById$.next(
      Object.fromEntries(fragments.map((fragment) => [fragment.id, fragment]))
    );
  });

  assert(
    setObjectProperty(component, "fragment$", (id: string) =>
      _fragmentsById$.pipe(
        map((fragments) => fragments[id]),
        distinctUntilChanged()
      )
    )
  );
  assert(
    setObjectGetter(
      component,
      "fragment",
      () => (id: string) => _fragmentsById$.value[id]
    )
  );

  // Setup stylesheets
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

  // Setup cleanup
  const baseDispose = (component as any).dispose?.bind(component);
  (component as any).dispose = () => {
    _fragmentsById$.complete();
    _allStylesheets$.complete();
    _nameSubject.complete();
    fragmentByIdSub.unsubscribe();
    propsList.dispose?.();
    fragmentsList.dispose?.();
    statesList.dispose?.();
    (stage as unknown as { dispose?: () => void }).dispose?.();
    (preview as unknown as { dispose?: () => void }).dispose?.();
    (templateYMap as unknown as { dispose?: () => void }).dispose?.();
    baseDispose?.();
  };

  return setEnhancer<Component>(component, attachComponent);
}
