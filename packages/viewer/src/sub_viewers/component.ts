import { Component, FileModel } from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  ComponentPropResolver,
  StaticComponentPropResolver,
} from "@elllphnt/elementa-runtime";
import { ComponentRenderable } from "@elllphnt/elementa-scene";
import { BehaviorSubject, of, switchMap } from "rxjs";
import { ViewerContext } from "../_context";
import { createSubViewerController } from "./_controller";
import { viewerIds } from "./_ids";
import { SubViewer } from "./sub_viewer";

export class ComponentViewer extends SubViewer {
  private _model$ = new BehaviorSubject<FileModel<Component> | undefined>(
    undefined
  );
  private _renderable$ = new BehaviorSubject<ComponentRenderable | undefined>(
    undefined
  );

  readonly propResolver: ComponentPropResolver;

  model$ = this._model$.asObservable();
  get model() {
    return this._model$.value;
  }

  renderable$ = this._renderable$.asObservable();
  get renderable() {
    return this._renderable$.value;
  }

  constructor(readonly context: ViewerContext) {
    super({ id: viewerIds.component });

    this.propResolver = new StaticComponentPropResolver({
      environment: this.context.environment,
    });

    const urlSubscription = this.url$.subscribe((url) => {
      if (url) {
        const componentUrl = decodeURIComponent(url.replace(/^component:/, ""));
        this._model$.next(this._getModel(componentUrl));
      } else {
        this._model$.next(undefined);
      }
    });

    const modelSubscription = this.model$
      .pipe(switchMap((model) => model?.model$ ?? of(undefined)))
      .subscribe((model) => {
        const current = this.renderable;
        if (model) {
          this._renderable$.next(this._getRenderable(model));
        } else {
          this._renderable$.next(undefined);
        }
        current?.dispose();
      });

    this.addDisposer(() => {
      urlSubscription.unsubscribe();
      modelSubscription.unsubscribe();
      this._renderable$.complete();
      this._model$.complete();
    });
  }

  private _getModel(componentUrl: string): FileModel<Component> {
    const projectUrl =
      this.context.infrastructure.resolveProjectUrl(componentUrl);
    if (!projectUrl) {
      throw Error("Failed to extract project url from component url.");
    }
    const project = this.context.infrastructure.project(projectUrl);
    return project.componentManager.component(componentUrl);
  }
  private _getRenderable(component: Component): ComponentRenderable {
    const instance = new ComponentInstance({
      model: component,
      propResolver: this.propResolver,
    });
    const renderable = new ComponentRenderable({
      instance,
      scene: this.context.scene,
    });
    return renderable;
  }

  override dispose(): void {
    super.dispose();
    this.renderable?.dispose();
  }
}

export function createComponentSubViewer() {
  return createSubViewerController({
    pattern: /^component:/,
    create: (context) => new ComponentViewer(context),
  });
}
