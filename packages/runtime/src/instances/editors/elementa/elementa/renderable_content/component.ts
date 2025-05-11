import {
  ComponentRenderableContent,
  SlotFill,
} from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable, of, switchMap } from "rxjs";
import {
  ComponentInputResolver,
  ComponentInstance,
} from "../../../../component/_.js";
import { FragmentEnvironment } from "../../../../fragment/_.js";
import { ModelInstance } from "../../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

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

export class ComponentRenderableContentInstance extends ModelInstance<ComponentRenderableContent> {
  private _component$ = new BehaviorSubject<ComponentInstance | undefined>(
    undefined
  );

  component$ = this._component$.asObservable();
  get component(): ComponentInstance | undefined {
    return this._component$.getValue();
  }

  constructor({
    model,
    environment,
  }: {
    model: ComponentRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaEditorInstanceType.RenderableContext,
      model,
      runtime: environment.runtime,
    });

    const componentSubscription = this.model.component$
      .pipe(switchMap((c) => c?.model$ ?? of(undefined)))
      .subscribe((component) => {
        const current = this.component;
        if (component) {
          this._component$.next(
            new ComponentInstance({
              component,
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
