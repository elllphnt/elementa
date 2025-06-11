import { ComponentRenderableContent, SlotFill } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import {
  ComponentInputResolver,
  ComponentInstance,
} from "../../../component/_.js";
import { FragmentEnvironment } from "../../../fragment/_.js";
import { BaseRenderableContentInstance } from "./_base.js";

export class ComponentRenderableContentInputResolver extends ComponentInputResolver {
  renderableContent: ComponentRenderableContent;

  constructor({
    environment,
    renderableContent,
  }: {
    environment: FragmentEnvironment;
    renderableContent: ComponentRenderableContent;
  }) {
    super({ environment });
    this.renderableContent = renderableContent;
  }

  propValue(name: string): unknown {
    return this.renderableContent.propValue(name);
  }

  propValue$(name: string): Observable<unknown> {
    return this.renderableContent.propValue$(name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  slotFill(id: string): SlotFill | undefined {
    return undefined; // slot fills are not supported in this context for now
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return of(undefined); // slot fills are not supported in this context for now
  }
}

export class ComponentRenderableContentInstance extends BaseRenderableContentInstance<ComponentRenderableContent> {
  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

  component$ = this._component$.asObservable();
  get component(): ComponentInstance | undefined {
    return this._component$.getValue();
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.component?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.component$.pipe(
        switchMap((component) => component?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, component]) => Math.max(own, component)));
  }

  constructor({
    model,
    environment,
  }: {
    model: ComponentRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      model,
      environment,
    });

    const componentSubscription = this.model.component$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((component) => {
        const current = this.component;
        if (component) {
          this._component$.next(
            new ComponentInstance({
              model: component,
              inputResolver: new ComponentRenderableContentInputResolver({
                environment,
                renderableContent: this.model,
              }),
              parent: this,
            })
          );
        } else {
          this._component$.next(undefined);
        }

        if (current) {
          current.dispose();
        }
      });

    this.addDisposer(() => {
      this._component$.complete();
      componentSubscription.unsubscribe();
    });
  }
}
