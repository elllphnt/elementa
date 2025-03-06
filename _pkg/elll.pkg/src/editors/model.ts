import { EditorState, EditorStateData, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map, of, switchMap } from "rxjs";
import { Model } from "../modules/elll/model/model";
import { IElll } from "../types/elll";

export type ModelEditorStateData = EditorStateData & {
  url?: string;
};

export abstract class ModelEditorState<
  D extends ModelEditorStateData = any,
> extends EditorState<D> {
  readonly shell: Shell;
  abstract modelConstructor: string;

  private _url$ = new BehaviorSubject<string | undefined>(undefined);
  private _model$ = new BehaviorSubject<Model | undefined>(undefined);

  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) {
      throw new Error("Elll not found in shell properties");
    }
    return elll;
  }

  get url() {
    return this._url$.value;
  }
  get url$() {
    return this._url$.asObservable();
  }

  get model() {
    return this._model$.value;
  }
  get model$() {
    return this._model$.asObservable();
  }

  get title$(): Observable<string> {
    return this.model$.pipe(
      switchMap(
        (model) =>
          model?.content?.name$.pipe(map((name) => name ?? "")) ?? of(""),
      ),
    );
  }
  get title(): string {
    return this.model?.content?.name ?? "";
  }

  get icon$(): Observable<{ name: string; color: string }> {
    return this.model$.pipe(
      switchMap((model) =>
        combineLatestOrEmpty([
          model?.icon$ ?? of(""),
          model?.color$ ?? of(""),
        ]).pipe(map(([name, color]) => ({ name, color }))),
      ),
    );
  }
  get icon(): { name: string; color: string } {
    return { name: this.model?.icon ?? "", color: this.model?.color ?? "" };
  }

  get loading$(): Observable<boolean> {
    return this.model$.pipe(
      switchMap((model) => model?.content?.loading$ ?? of(false)),
    );
  }
  get loading(): boolean {
    return this.model?.content?.loading ?? false;
  }

  get _data(): ModelEditorStateData {
    return {
      id: this.id,
      editorId: this.editorId,
      url: this.url,
    };
  }
  get _data$(): Observable<ModelEditorStateData> {
    return combineLatestOrEmpty([this.url$]).pipe(
      map(([url]) => ({
        id: this.id,
        editorId: this.editorId,
        url,
      })),
    );
  }

  constructor({
    id,
    shell,
    editorId,
  }: {
    id?: string;
    shell: Shell;
    editorId: string;
  }) {
    super({ id, shell, editorId });
    this.shell = shell;

    const urlModelSubscription = this.url$.subscribe((url) => {
      if (url) {
        try {
          const model = this.elll.modelManager.getModel(
            this.modelConstructor,
            url,
          );
          this._model$.next(model);
        } catch (e) {
          this.elll.shell.toast(`Failed to load model for ${url}.`);
          console.error(e);
        }
      } else {
        this._model$.next(undefined);
      }
    });

    this.addDisposer(() => {
      this._model$.complete();
      this._url$.complete();

      urlModelSubscription.unsubscribe();
    });
  }

  setUrl(url: string | undefined) {
    this._url$.next(url);
  }

  restore(data: ModelEditorStateData): void {
    if (data.url) {
      this._url$.next(data.url ?? undefined);
    }
  }
}
