import { FragmentRenderableContent } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import {
  FragmentEnvironment,
  FragmentInputResolver,
  FragmentInstance,
} from "../../../fragment/_.js";
import { ModelInstance } from "../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class FragmentRenderableContentInputResolver extends FragmentInputResolver {
  renderableContent: FragmentRenderableContent;

  constructor({
    environment,
    renderableContent,
  }: {
    environment: FragmentEnvironment;
    renderableContent: FragmentRenderableContent;
  }) {
    super({ environment });
    this.renderableContent = renderableContent;
  }

  paramValue(name: string): unknown {
    return this.renderableContent.paramValue(name);
  }
  paramValue$(name: string): Observable<unknown> {
    return this.renderableContent.paramValue$(name);
  }
}

export class FragmentRenderableContentInstance extends ModelInstance<FragmentRenderableContent> {
  inputResolver: FragmentRenderableContentInputResolver;

  private _fragment$ = new BehaviorSubject<FragmentInstance | undefined>(
    undefined
  );

  fragment$ = this._fragment$.asObservable();
  get fragment(): FragmentInstance | undefined {
    return this._fragment$.getValue();
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.fragment?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.fragment$.pipe(
        switchMap((fragment) => fragment?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, fragment]) => Math.max(own, fragment)));
  }

  constructor({
    model,
    environment,
  }: {
    model: FragmentRenderableContent;
    environment: FragmentEnvironment;
  }) {
    super({
      type: ElementaEditorInstanceType.RenderableContent,
      model,
      runtime: environment.runtime,
    });

    this.inputResolver = new FragmentRenderableContentInputResolver({
      environment,
      renderableContent: this.model,
    });

    const fragmentSubscription = this.model.fragment$.subscribe((fragment) => {
      const current = this.fragment;
      if (fragment) {
        this._fragment$.next(
          new FragmentInstance({
            model: fragment,
            inputResolver: this.inputResolver,
            parent: this,
          })
        );
      } else {
        this._fragment$.next(undefined);
      }

      if (current) {
        current.dispose();
      }
    });

    this.addDisposer(() => {
      this._fragment$.complete();
      fragmentSubscription.unsubscribe();
    });
  }
}
