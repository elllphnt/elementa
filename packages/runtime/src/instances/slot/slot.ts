import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ElementInstance } from "../elements/_.js";
import { createElementInstance } from "../elements/_element.js";
import { FragmentEnvironment } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { StyleSheetInstance } from "../stylesheet/stylesheet.js";

export class SlotInstance extends Instance {
  readonly environment: FragmentEnvironment;
  readonly slotId: string;

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);
  private _stylesheet$ = new BehaviorSubject<StyleSheetInstance | undefined>(
    undefined
  );

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get stylesheet$(): Observable<StyleSheetInstance | undefined> {
    return this._stylesheet$;
  }
  get stylesheet(): StyleSheetInstance | undefined {
    return this._stylesheet$.value;
  }

  get selector() {
    return [...this.environment.styleModifiers].sort().join(":");
  }
  get selector$() {
    return this.environment.styleModifiers$.pipe(
      map((styleModifiers) => [...styleModifiers].sort().join(":"))
    );
  }

  get fill() {
    return this.environment.slotFill(this.slotId);
  }
  get fill$() {
    return this.environment.slotFill$(this.slotId);
  }

  get diagnosticLevel(): number {
    const stylesheetLevel = this.stylesheet?.diagnosticLevel ?? 0;
    return Math.max(
      this.ownDiagnosticLevel,
      stylesheetLevel,
      ...this.content.map((c) => c.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.stylesheet$.pipe(
        switchMap((sheet) => sheet?.diagnosticLevel$ ?? of(0))
      ),
      this.content$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(
      map(([own, stylesheetLevel, contentLevels]) =>
        Math.max(own, stylesheetLevel, ...contentLevels)
      )
    );
  }

  constructor({
    slotId,
    environment,
    parent,
  }: {
    slotId: string;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.Slot,
      runtime: environment.runtime,
      parent,
    });
    this.slotId = slotId;
    this.environment = environment;

    const contentSubscription = this.fill$
      .pipe(switchMap((fill) => fill?.content$ ?? of([])))
      .subscribe((content) => {
        const [newContent, removed] = reconcileList({
          sources: content,
          targets: this.content,
          sourceRef: (e) => e,
          targetRef: (i) => i.element,
          create: (element) =>
            createElementInstance({
              element,
              environment: this.environment,
              parent: this,
            }),
        });
        this._content$.next(newContent);
        removed.forEach((instance) => {
          instance.dispose();
        });
      });

    const stylesheetSubscription = this.fill$
      .pipe(
        map((fill) => fill?.cssStyleSheet.stylesheet),
        distinctUntilChanged()
      )
      .subscribe((stylesheet) => {
        const currentStylesheet = this.stylesheet;
        if (stylesheet) {
          this._stylesheet$.next(
            new StyleSheetInstance({
              stylesheet,
              parent: this,
              runtime: this.runtime,
              cascadeResolver: {
                getParentStylesheetInstance: () => undefined,
              },
            })
          );
        } else {
          this._stylesheet$.next(undefined);
        }

        if (currentStylesheet) {
          currentStylesheet.dispose();
        }
      });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      stylesheetSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      this.stylesheet?.dispose();
      this._stylesheet$.next(undefined);
      this._stylesheet$.complete();
    });
  }
}
