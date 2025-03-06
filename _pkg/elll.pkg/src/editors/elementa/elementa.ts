import { ElementaRenderer } from "@repo/elementa-renderer";
import { ElementaStager } from "@repo/elementa-stager";
import { ElementaViewer } from "@repo/elementa-viewer";
import { Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map, of, switchMap } from "rxjs";
import { ModelEditorState, ModelEditorStateData } from "../model";

export type ElementaBaseEditorStateData = ModelEditorStateData & {};

export type ElementaInitializer = <M extends "editor" | "viewer">(
  mode: M,
) => Promise<M extends "editor" ? ElementaStager : ElementaViewer>;

export type Log = {
  type: "log" | "error" | "warn" | "info" | "debug";
  content: any[];
};

export abstract class ElementaBaseEditorState<
  D extends ElementaBaseEditorStateData,
> extends ModelEditorState<D> {
  abstract get iframe(): HTMLIFrameElement;
  private _logs = new BehaviorSubject<Log[]>([]);

  abstract get elementaRenderer(): ElementaRenderer | undefined;
  abstract get elementaRenderer$(): Observable<ElementaRenderer | undefined>;

  get logs() {
    return this._logs.value;
  }
  get logs$() {
    return this._logs.asObservable();
  }

  get loading$(): Observable<boolean> {
    return combineLatestOrEmpty([super.loading$, this.elementaRenderer$]).pipe(
      map(([superLoading, editor]) => superLoading || !editor),
    );
  }
  get loading(): boolean {
    return super.loading || !this.elementaRenderer;
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
    super({ id, editorId, shell });
  }

  watchRoot() {
    const rootSubscription = this.elll.shell.workspace$
      .pipe(switchMap((workspace) => workspace?.root$ ?? of(undefined)))
      .subscribe((root) => {
        if (root) {
          root.appendChild(this.iframe);
        }
      });

    this.addDisposer(() => {
      rootSubscription.unsubscribe();
    });
  }

  private _resizeObserver = new ResizeObserver((entry) => {
    const rect = entry[0].target.getBoundingClientRect();
    this._applyRect(rect);
  });
  protected _applyRect(rect: DOMRect) {
    this.iframe.style.width = `${rect.width}px`;
    this.iframe.style.height = `${rect.height}px`;
    this.iframe.style.left = `${rect.x}px`;
    this.iframe.style.top = `${rect.y}px`;
  }
  mount(element: HTMLElement) {
    this.iframe.style.display = "block";
    this._applyRect(element.getBoundingClientRect());
    this._resizeObserver.observe(element);
  }
  unmount() {
    this.iframe.style.display = "none";
    this._resizeObserver.disconnect();
  }
}
