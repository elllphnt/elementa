import type {
  ComponentRenderableContent,
  SlotFill,
} from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import { ComponentInstance } from "~/instances/component/component.js";
import { ComponentInputResolver } from "~/instances/component/input_resolver/input_resolver.js";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import { BaseRenderableContentInstance } from "./_base.js";

export class ComponentRenderableContentInputResolver extends ComponentInputResolver {
  renderableContent: ComponentRenderableContent;

  constructor({
    environment,
    renderableContent,
  }: {
    environment: ElementRuntimeEnvironment;
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
    environment: ElementRuntimeEnvironment;
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
          const instance = new ComponentInstance({
            model: component,
            inputResolver: new ComponentRenderableContentInputResolver({
              environment,
              renderableContent: this.model,
            }),
            parent: this,
          });
          this.addLifecycle(instance);
          this._component$.next(instance);
        } else {
          this._component$.next(undefined);
        }

        if (current) {
          this.removeLifecycle(current);
          current.dispose();
        }
      });

    this.addDisposer(() => {
      if (this.component) {
        this.removeLifecycle(this.component);
        this.component.dispose();
      }
      this._component$.complete();
      componentSubscription.unsubscribe();
    });
  }
}
