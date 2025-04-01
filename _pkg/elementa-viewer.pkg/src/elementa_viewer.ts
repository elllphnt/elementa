import { entityTypes, resetCss } from "@elllphnt/elll-element";
import {
  ChildFragmentEnvironment,
  Elementa,
  FragmentEnvironment,
  FragmentInstance,
  makeStateInstance,
  SlotInstance,
  StateInstance,
  updateInstanceList,
} from "@repo/elementa";
import {
  Fragment,
  FragmentParam,
  FrameWidget,
  Prop,
  SlotFill,
} from "@repo/elementa-models";
import {
  ElementaRenderer,
  FragmentRenderable,
  Router,
  updateInstanceRenderableList,
} from "@repo/elementa-renderer";
import { DomStyleSheetManager } from "@repo/elementa-renderer/dist/style/dom/manager";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import ElementaViewerComponent from "./components/elementa_viewer";

export class ElementaViewerFragmentEnvironment extends FragmentEnvironment {
  readonly editor: ElementaViewer;

  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);

  get id() {
    return `fragment-environment-viewer`;
  }

  get paged$() {
    return of(true);
  }
  get paged() {
    return true;
  }

  get componentStack() {
    const component = this.editor.elementa.component;
    return component ? [component.url] : [];
  }
  get componentStack$() {
    return this.editor.elementa.component$.pipe(
      map((component) => (component ? [component.url] : [])),
    );
  }

  get styleModifiers() {
    return [];
  }
  get styleModifiers$() {
    return of([]);
  }

  get states(): StateInstance[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance[]> {
    return this._states$.asObservable();
  }

  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }

  get props(): Prop[] {
    return this.editor.elementa.component?.props ?? [];
  }
  get props$(): Observable<Prop[]> {
    return this.editor.elementa.component$.pipe(
      switchMap((component) => component?.props$ ?? of([])),
    );
  }

  get defaultFrame() {
    return this.editor.elementa.component?.widgets.find(
      (w) => w.type === entityTypes.widgets.frame,
    ) as FrameWidget;
  }
  get defaultFrame$() {
    return this.editor.elementa.component$.pipe(
      switchMap((component) => component?.widgets$ ?? of([])),
      map(
        (widgets) =>
          widgets.find(
            (w) => w.type === entityTypes.widgets.frame,
          ) as FrameWidget,
      ),
    );
  }

  propValue(prop: Prop): any {
    return this.defaultFrame?.prop(prop.identifier || "") ?? prop.default;
  }
  propValue$(prop: Prop): Observable<any> {
    return prop.identifier$.pipe(
      switchMap((identifier) =>
        this.defaultFrame$.pipe(
          switchMap((frame) => frame.prop$(identifier || "")),
        ),
      ),
      switchMap((value) => {
        if (value) {
          return of(value);
        } else {
          return prop.default$;
        }
      }),
    );
  }

  paramValue(param: FragmentParam) {
    return undefined;
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return of(undefined);
  }

  get slots(): SlotInstance[] {
    return [];
  }
  get slots$(): Observable<SlotInstance[]> {
    return of([]);
  }
  slotFill(id: string): SlotFill | undefined {
    return undefined;
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return of(undefined);
  }

  constructor({
    entity,
    editor,
  }: {
    entity: Fragment;
    editor: ElementaViewer;
  }) {
    super({
      entity,
      elementa: editor.elementa,
    });
    this.editor = editor;

    const statesSubscription = this.editor.elementa.component$
      .pipe(switchMap((component) => component?.states$ ?? of([])))
      .subscribe((states) => {
        const newStates = updateInstanceList({
          instances: this.states,
          entities: states,
          createInstance: (state) =>
            makeStateInstance({ state, elementa: this.elementa, parent: null }),
        });

        this._states$.next(newStates);
      });

    const fragmentsSubscription = this.editor.elementa.component$
      .pipe(switchMap((component) => component?.fragments$ ?? of([])))
      .subscribe((fragments) => {
        const newFragments = updateInstanceList({
          instances: this.fragments,
          entities: fragments,
          createInstance: (fragment) => {
            const environment = new ChildFragmentEnvironment({
              entity: fragment,
              parent: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: null,
            });

            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });
        this._fragments$.next(newFragments);
      });

    this.addDisposer(() => {
      statesSubscription.unsubscribe();
      fragmentsSubscription.unsubscribe();

      this.states.forEach((state) => state.dispose());
      this.fragments.forEach((fragment) => fragment.dispose());

      this._states$.next([]);
      this._fragments$.next([]);

      this._states$.complete();
      this._fragments$.complete();
    });
  }
}

export class ElementaViewer extends ElementaRenderer {
  readonly router: Router;
  private reactRoot: Root | undefined;

  private _template$ = new BehaviorSubject<FragmentRenderable | undefined>(
    undefined,
  );
  private _colorScheme$ = new BehaviorSubject<"default" | "dark">("default");

  get template() {
    return this._template$.value;
  }
  get template$() {
    return this._template$.asObservable();
  }

  get colorScheme() {
    return this._colorScheme$.value;
  }
  get colorScheme$() {
    return this._colorScheme$.asObservable();
  }

  get ready() {
    return this.template?.ready ?? false;
  }
  get ready$() {
    return this.template$.pipe(switchMap((page) => page?.ready$ ?? of(false)));
  }

  constructor({
    elementa,
    stylesheetManager,
    router,
  }: {
    elementa: Elementa;
    stylesheetManager: DomStyleSheetManager;
    router: Router;
  }) {
    super({
      elementa,
      stylesheetManager,
    });

    this.router = router;

    const fragmentSubscription = this.elementa.component$
      .pipe(map((component) => component?.template))
      .subscribe((template) => {
        const newInstances = updateInstanceList({
          instances: this.template ? [this.template.instance] : [],
          entities: (template ? [template] : []) as Fragment[],
          createInstance: (entity) => {
            const environment = new ElementaViewerFragmentEnvironment({
              entity,
              editor: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: null,
            });
            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });

        const newRenderables = updateInstanceRenderableList({
          renderables: this.template ? [this.template] : [],
          instances: newInstances,
          renderer: this,
        });

        this._template$.next(newRenderables[0]);
      });

    this.addDisposer(() => {
      fragmentSubscription.unsubscribe();
    });
  }

  mount(container: HTMLElement) {
    const elementaResetStylesheet = document.createElement("style");
    elementaResetStylesheet.innerHTML = resetCss();
    document.head.appendChild(elementaResetStylesheet);

    this.reactRoot = createRoot(container);
    container.classList.add("elementa-preview");
    this.reactRoot.render(
      createElement(ElementaViewerComponent, { viewer: this }),
    );
  }
  unmount() {
    this.reactRoot?.unmount();
    this.reactRoot = undefined;
  }

  setColorScheme(colorScheme: "default" | "dark") {
    this._colorScheme$.next(colorScheme);
  }
}
