import { EditorState, EditorStateData, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map, of, switchMap } from "rxjs";
import { IElll } from "../elll/_types";

const id = "elll.editor.content";

export interface EditorContent {
  url: string;

  name: string;
  name$: Observable<string>;

  icon: string;
  icon$: Observable<string>;

  color: string;
  color$: Observable<string>;

  loading: boolean;
  loading$: Observable<boolean>;
}

export type ContentEditorStateData = EditorStateData & {
  url?: string;
};

export abstract class ContentEditorState<
  C extends EditorContent = any,
  D extends ContentEditorStateData = any,
> extends EditorState<D> {
  readonly shell: Shell;

  private _url$ = new BehaviorSubject<string | undefined>(undefined);

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

  abstract get content(): C | undefined;
  abstract get content$(): Observable<C | undefined>;

  get title$(): Observable<string> {
    return this.content$.pipe(switchMap((content) => content?.name$ ?? of("")));
  }
  get title(): string {
    return this.content?.name ?? "";
  }

  get icon$(): Observable<{ name: string; color: string }> {
    return this.content$.pipe(
      switchMap((content) =>
        combineLatestOrEmpty([
          content?.icon$ ?? of(""),
          content?.color$ ?? of(""),
        ]).pipe(map(([name, color]) => ({ name, color }))),
      ),
    );
  }
  get icon(): { name: string; color: string } {
    return { name: this.content?.icon ?? "", color: this.content?.color ?? "" };
  }

  get _data(): ContentEditorStateData {
    return {
      id: this.id,
      editorId: this.editorId,
      url: this.url,
    };
  }
  get _data$(): Observable<ContentEditorStateData> {
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
  }

  setUrl(url: string | undefined) {
    this._url$.next(url);
  }

  restore(data: ContentEditorStateData): void {
    if (data.url) {
      this._url$.next(data.url ?? undefined);
    }
  }
}
