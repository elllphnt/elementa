import type { Observable } from "rxjs";
import { BehaviorSubject, map, of, switchMap } from "rxjs";
import { ModelAdaptor } from "~/models/adaptor.js";
import { App } from "~/models/app/app.js";
import { Component } from "~/models/component/component.js";
import { PackageSheet } from "~/models/packages/package_sheet.js";
import { Router } from "~/models/router/router.js";
import { KeyframeSheet } from "~/models/style/keyframes/keyframe_sheet.js";
import { StyleModifierSheet } from "~/models/style/style_modifiers/style_modifier_sheet.js";
import { StyleSystem } from "~/models/style/style_system/style_system.js";
import { StyleVariableSheet } from "~/models/style/style_variables/style_variable_sheet.js";
import { Stylesheet } from "~/models/style/stylesheet/stylesheet.js";
import { TypefaceSheet } from "~/models/style/typefaces/typeface_sheet.js";
import type { FileModelType, FileModelTypeName } from "../../models/types.js";
import { fileModelTypes } from "../../models/types.js";
import { AsyncResourceStatus } from "../resource.js";
import type { File, FileReference } from "./file.js";

export abstract class FileModelAdaptor<
  N extends FileModelTypeName,
  F extends File = File
> extends ModelAdaptor<FileModelType<N>> {
  readonly file: F;
  readonly modelType: N;

  private _model$ = new BehaviorSubject<FileModelType<N> | undefined>(
    undefined
  );

  abstract get state(): FileModelType<N>["state"] | undefined;
  abstract get state$(): Observable<FileModelType<N>["state"] | undefined>;

  get model(): FileModelType<N> | undefined {
    return this._model$.value;
  }
  get model$(): Observable<FileModelType<N> | undefined> {
    return this._model$;
  }

  constructor({ file, modelType }: { file: F; modelType: N }) {
    super();
    this.file = file;
    this.modelType = modelType;

    this.addInitializer(() => {
      const stateSubscription = this.state$.subscribe((state) => {
        const previousModel = this.model;
        if (!state) {
          this._model$.next(undefined);
        } else {
          const nextModel = this.createModel(state);
          this._model$.next(nextModel);
          this.addLifecycle(nextModel);
        }
        if (previousModel) {
          previousModel.dispose();
          this.removeLifecycle(previousModel);
        }
      });

      this.addDisposer(() => {
        stateSubscription.unsubscribe();
      });
    });

    this.addDisposer(() => {
      this._model$.complete();
    });
  }

  private createModel(state: FileModelType<N>["state"]): FileModelType<N> {
    switch (this.modelType) {
      case fileModelTypes.app: {
        return new App({
          state: state as FileModelType<"app">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.component: {
        return new Component({
          state: state as FileModelType<"component">["state"],
          project: this.file.project,
          url: this.file.url,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.router: {
        return new Router({
          state: state as FileModelType<"router">["state"],
          project: this.file.project,
          url: this.file.url,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.packageSheet: {
        return new PackageSheet({
          state: state as FileModelType<"package-sheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.stylesheet: {
        return new Stylesheet({
          state: state as FileModelType<"stylesheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.styleSystem: {
        return new StyleSystem({
          state: state as FileModelType<"style-system">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.styleVariableSheet: {
        return new StyleVariableSheet({
          state: state as FileModelType<"variable-sheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.styleModifierSheet: {
        return new StyleModifierSheet({
          state: state as FileModelType<"style-modifier-sheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.keyframeSheet: {
        return new KeyframeSheet({
          state: state as FileModelType<"keyframe-sheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      case fileModelTypes.typefaceSheet: {
        return new TypefaceSheet({
          state: state as FileModelType<"typeface-sheet">["state"],
          project: this.file.project,
          initialized: true,
        }) as FileModelType<N>;
      }
      default: {
        throw new Error(`Unknown model type: ${this.modelType}`);
      }
    }
  }
}

export class FileReferenceModelAdaptor<
  N extends FileModelTypeName,
  F extends File = File
> extends ModelAdaptor<FileModelType<N>> {
  readonly fileReference: FileReference<F>;
  readonly modelType: N;

  get fileModelAdaptor$(): Observable<FileModelAdaptor<N, F> | undefined> {
    return this.fileReference.file$.pipe(
      map((file) => {
        if (!file) {
          return undefined;
        }
        return this.fileReference.project.fileModelAdaptor(
          this.modelType,
          file.id
        );
      })
    );
  }
  get fileModelAdaptor(): FileModelAdaptor<N, F> | undefined {
    const file = this.fileReference.file;
    return file
      ? this.fileReference.project.fileModelAdaptor(this.modelType, file.id)
      : undefined;
  }

  get model() {
    return this.fileModelAdaptor?.model;
  }
  get model$() {
    return this.fileModelAdaptor$.pipe(
      switchMap((adaptor) => adaptor?.model$ || of(undefined))
    );
  }

  constructor({
    modelType,
    fileReference,
  }: {
    modelType: N;
    fileReference: FileReference<F>;
  }) {
    super();
    this.fileReference = fileReference;
    this.modelType = modelType;

    this.addInitializer(() => {
      const statusSubscription = this.fileModelAdaptor$
        .pipe(
          switchMap((file) => {
            if (file) return file.status$;
            else return of(AsyncResourceStatus.Pending);
          })
        )
        .subscribe((status) => this.setStatus(status));

      this.addDisposer(() => {
        statusSubscription.unsubscribe();
      });
    });
  }
}
