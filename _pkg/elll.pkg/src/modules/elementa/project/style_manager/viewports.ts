import {
  StyleModifierData,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "@elllphnt/elll-element";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";

export type ViewportData = {
  name: string;
  width?: [number | null, number | null];
  height?: [number | null, number | null];
  ratio?: [number | null, number | null];
  modifiers: StyleModifierData[];
};

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
  };
}

export function viewportFromBreakpoint({
  name,
  value,
}: {
  name: string;
  value: number;
}): ViewportData {
  return {
    name,
    width: [value, null],
    modifiers: [{ name }],
  };
}

export class ViewportManager extends Disposable {
  private _breakpoints$ = new BehaviorSubject<Record<string, number>>({});
  private _viewports$ = new BehaviorSubject<ViewportData[]>([]);
  private _breakpointBasedViewports$ = new BehaviorSubject<ViewportData[]>([]);
  private _breakpointBasedModifiers$ = new BehaviorSubject<
    StyleModifierDefinitionData[]
  >([]);

  get breakpoints(): Record<string, number> {
    return this._breakpoints$.value;
  }
  get breakpoints$(): Observable<Record<string, number>> {
    return this._breakpoints$;
  }

  get viewports(): ViewportData[] {
    return [
      ...this._viewports$.value,
      ...this._breakpointBasedViewports$.value,
    ];
  }
  get viewports$(): Observable<ViewportData[]> {
    return combineLatest([
      this._viewports$,
      this._breakpointBasedViewports$,
    ]).pipe(map(([viewports, bpViews]) => [...viewports, ...bpViews]));
  }

  get modifiers(): StyleModifierDefinitionData[] {
    return this._breakpointBasedModifiers$.value;
  }
  get modifiers$(): Observable<StyleModifierDefinitionData[]> {
    return this._breakpointBasedModifiers$;
  }

  // Helper to select matching viewport modifiers.
  private _getViewportModifiers({
    width = 0,
    height = 0,
    viewports,
  }: {
    width?: number;
    height?: number;
    viewports: ViewportData[];
  }): any[] {
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
      return viewport.modifiers;
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
  }): any[] {
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
  }): Observable<any[]> {
    return this.viewports$.pipe(
      map((viewports) =>
        this._getViewportModifiers({ width, height, viewports }),
      ),
    );
  }

  constructor() {
    super();

    const breakpointSubscription = this.breakpoints$.subscribe(
      (breakpoints) => {
        this._breakpointBasedModifiers$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            modifierFromBreakpoint({ id: name, name, value }),
          ),
        );
        this._breakpointBasedViewports$.next(
          Object.entries(breakpoints).map(([name, value]) =>
            viewportFromBreakpoint({ name, value }),
          ),
        );
      },
    );

    this.addDisposer(() => {
      breakpointSubscription.unsubscribe();
      this._breakpointBasedModifiers$.complete();
    });
  }

  // Restore viewports from stored data.
  restore(viewports: ViewportData[]): void {
    this._viewports$.next(viewports);
  }
}
