import {
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleModifierType,
  ViewportDefinitionData,
} from "@elllphnt/elementa-base";
import { Disposable } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { Project } from "../project.js";

export function modifierFromBreakpoint({
  id,
  name,
  value,
}: {
  id: string;
  name: string;
  value: number;
}): StyleModifierDefinitionData {
  return {
    id,
    name,
    type: StyleModifierType.Context,
    selector: [`@media (min-width: ${value}px)`],
    __crdtAtomic: ["signature", "selector"],
  };
}
export function viewportFromBreakpoint({
  name,
  value,
}: {
  name: string;
  value: number;
}): ViewportDefinitionData {
  return {
    name,
    width: [value, null],
    modifiers: [{ name }],
    __crdtAtomic: ["width", "height", "ratio", "modifiers[*]"],
  };
}

export class ViewportManager extends Disposable {
  project: Project;

  private _breakpointBasedDefinitions$ = new BehaviorSubject<
    ViewportDefinitionData[]
  >([]);
  private _breakpointBasedModifiers$ = new BehaviorSubject<
    StyleModifierDefinitionData[]
  >([]);

  get breakpointBasedDefinitions() {
    return this._breakpointBasedDefinitions$.value;
  }
  get breakpointBasedDefinitions$() {
    return this._breakpointBasedDefinitions$.asObservable();
  }

  get breakpointBasedModifiers() {
    return this._breakpointBasedModifiers$.value;
  }
  get breakpointBasedModifiers$() {
    return this._breakpointBasedModifiers$.asObservable();
  }

  get styleSystem() {
    return this.project.styleSystem.model;
  }
  get styleSystem$() {
    return this.project.styleSystem.model$;
  }

  get viewports() {
    const source = this.styleSystem?.viewports.source;
    if (source === "definitions") {
      return this.styleSystem?.viewports.definitions || [];
    } else {
      return this.breakpointBasedDefinitions;
    }
  }
  get viewports$(): Observable<ViewportDefinitionData[]> {
    return this.styleSystem$.pipe(
      switchMap((system) =>
        combineLatest({
          source: system?.viewports.source$ ?? of(undefined),
          viewports: of(system?.viewports),
        })
      ),
      switchMap(({ source, viewports }) => {
        if (source === "definitions") {
          return viewports?.definitions$ || of([]);
        } else {
          return this.breakpointBasedDefinitions$;
        }
      })
    );
  }

  get modifiers() {
    const source = this.styleSystem?.viewports.source;
    if (source === "definitions") {
      return [];
    } else {
      return this.breakpointBasedModifiers;
    }
  }
  get modifiers$() {
    return this.styleSystem$.pipe(
      switchMap((system) => system?.viewports.source$ ?? of(undefined)),
      switchMap((source) => {
        if (source === "definitions") {
          return of([]);
        } else {
          return this.breakpointBasedModifiers$;
        }
      })
    );
  }

  // Helper to select matching viewport modifiers.
  private _getViewportModifiers({
    width = 0,
    height = 0,
    viewports,
  }: {
    width?: number;
    height?: number;
    viewports: ViewportDefinitionData[];
  }): StyleModifierData[] {
    // ...existing code excerpt...
    for (const viewport of [...viewports].reverse()) {
      // Assuming matchViewport is defined elsewhere or inline.
      const [minWidth, maxWidth] = viewport.width || [null, null];
      if (minWidth !== null && width < minWidth) continue;
      if (maxWidth !== null && width > maxWidth) continue;
      if (viewport.height) {
        const [minHeight, maxHeight] = viewport.height;
        if (minHeight !== null && height < minHeight) continue;
        if (maxHeight !== null && height > maxHeight) continue;
      }
      if (viewport.ratio && width && height) {
        const [minRatio, maxRatio] = viewport.ratio;
        const actualRatio = width / height;
        if (minRatio !== null && actualRatio < minRatio) continue;
        if (maxRatio !== null && actualRatio > maxRatio) continue;
      }
      return viewport.modifiers || [];
    }
    return [];
  }

  // Exposed methods.
  viewportModifiers({
    width,
    height,
  }: {
    width?: number;
    height?: number;
  }): StyleModifierData[] {
    return this._getViewportModifiers({
      width,
      height,
      viewports: this.viewports,
    });
  }
  viewportModifiers$({
    width,
    height,
  }: {
    width?: number;
    height?: number;
  }): Observable<StyleModifierData[]> {
    return this.viewports$.pipe(
      map((viewports) =>
        this._getViewportModifiers({ width, height, viewports })
      )
    );
  }

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;

    this.addDisposer(() => {
      this._breakpointBasedDefinitions$.complete();
      this._breakpointBasedModifiers$.complete();
    });
  }

  init() {
    const breakpointSubscription = this.styleSystem$
      .pipe(
        switchMap(
          (s) => s?.viewports.breakpoints$ ?? of({} as Record<string, number>)
        )
      )
      .subscribe((breakpoints) => {
        this._breakpointBasedModifiers$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            modifierFromBreakpoint({ id: name, name, value })
          )
        );
        this._breakpointBasedDefinitions$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            viewportFromBreakpoint({ name, value })
          )
        );
      });

    this.addDisposer(() => {
      breakpointSubscription.unsubscribe();
    });
  }
}
