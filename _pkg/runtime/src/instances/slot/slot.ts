import { reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { ElementInstance, FragmentEnvironment } from "../_";
import { createElementInstance } from "../elements/_create";
import { Instance, InstanceType } from "../instance";
import { StyleSheetInstance } from "../stylesheet/stylesheet";

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
      type: InstanceType.Slot,
      runtime: environment.runtime,
      parent,
    });
    this.slotId = slotId;
    this.environment = environment;

    const contentSubscription = this.fill$
      .pipe(switchMap((fill) => fill?.content.observable$ ?? of([])))
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
