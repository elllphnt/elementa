import { App, FileModel } from "@elllphnt/elementa-models";
import { AppInstance } from "@elllphnt/elementa-runtime";
import { AppRenderable } from "@elllphnt/elementa-scene";
import { createMemoryHistory } from "@tanstack/react-router";
import { BehaviorSubject, of, switchMap } from "rxjs";
import { ViewerContext } from "../_context";
import { createSubViewerController } from "./_controller";
import { viewerIds } from "./_ids";
import { SubViewer } from "./sub_viewer";

export class AppViewer extends SubViewer {
  private _model$ = new BehaviorSubject<FileModel<App> | undefined>(undefined);
  private _renderable$ = new BehaviorSubject<AppRenderable | undefined>(
    undefined
  );

  model$ = this._model$.asObservable();
  get model() {
    return this._model$.value;
  }

  renderable$ = this._renderable$.asObservable();
  get renderable() {
    return this._renderable$.value;
  }

  constructor(readonly context: ViewerContext) {
    super({ id: viewerIds.app });

    const urlSubscription = this.url$.subscribe((url) => {
      if (url) {
        const appUrl = decodeURIComponent(url.replace(/^app:/, ""));
        this._model$.next(this._getModel(appUrl));
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

  private _getModel(appUrl: string): FileModel<App> {
    const projectUrl = this.context.infrastructure.resolveProjectUrl(appUrl);
    if (!projectUrl) {
      throw Error("Failed to extract project url from app url.");
    }
    const project = this.context.infrastructure.project(projectUrl);
    return project.appManager.app(appUrl);
  }
  private _getRenderable(app: App): AppRenderable {
    const instance = new AppInstance({
      model: app,
      environment: this.context.environment,
    });
    const renderable = new AppRenderable({
      instance,
      scene: this.context.scene,
      history: createMemoryHistory({
        initialEntries: ["/"],
      }),
    });
    return renderable;
  }

  override dispose(): void {
    super.dispose();
    this.renderable?.dispose();
  }
}

export function createAppSubViewer() {
  return createSubViewerController({
    pattern: /^app:/,
    create: (context) => new AppViewer(context),
  });
}
