import { elllIcons16 } from "@repo/components";
import { ElementaData, ElementaEditor } from "@repo/elementa";
import { Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { ElllComponent } from "~/src/libs/project/components/component";
import { elllPropertyKeys } from "../../elll/property_keys";
import { ElementaConfig } from "../../elll/setup";
import { ElementaHost } from "../../libs/elementa/host";
import { ElllProject } from "../../libs/project/project";
import { editorViews } from "../../views/editors/_";
import { ContentEditorState, ContentEditorStateData } from "../content";
import { stylesheetManager } from "./libs/globals";

const editorId = "elll.editor.elementa";

export type ComponentEditorStateData = ContentEditorStateData & {
  elementa?: ElementaData;
};

export class ComponentEditorState extends ContentEditorState<
  ElllComponent,
  ComponentEditorStateData
> {
  readonly iframe: HTMLIFrameElement;
  readonly host = new ElementaHost({
    elll: this.elll,
    getIframe: () => document.body,
  });

  get stylesheetManager() {
    return stylesheetManager;
  }

  private _elementaEditor$ = new BehaviorSubject<ElementaEditor | undefined>(
    undefined,
  );

  get elementaEditor() {
    return this._elementaEditor$.value;
  }
  get elementaEditor$() {
    return this._elementaEditor$.asObservable();
  }

  get elementa() {
    return this.elementaEditor?.elementa;
  }
  get elementa$() {
    return this.elementaEditor$.pipe(map((e) => e?.elementa));
  }

  get content(): ElllComponent | undefined {
    return this.url
      ? this.elll.project.componentStore.component(this.url)
      : undefined;
  }
  get content$(): Observable<ElllComponent | undefined> {
    return this.url$.pipe(
      map((url) =>
        url ? this.elll.project.componentStore.component(url) : of(undefined),
      ),
    );
  }

  get data(): ComponentEditorStateData {
    return {
      ...super._data,
      elementa: this.elementaEditor?.data,
    };
  }
  get data$(): Observable<ComponentEditorStateData> {
    return combineLatestOrEmpty([
      super._data$,
      this.elementaEditor$.pipe(switchMap((e) => e?.data$ ?? of(undefined))),
    ]).pipe(
      map(([superData, elementa]) => ({
        ...superData,
        elementa,
      })),
    );
  }

  get project(): ElllProject {
    return this.elll.project;
  }

  get editorManager() {
    return this.elll.editorManager;
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({
      id,
      editorId,
      shell,
    });

    this.iframe = document.createElement("iframe");
    this.iframe.style.position = "fixed";
    this.iframe.style.width = "100%";
    this.iframe.style.height = "100%";
    this.iframe.style.border = "none";
    this.iframe.style.display = "none";
    this.iframe.style.pointerEvents = "auto";
    this.iframe.src =
      this.elll.properties.value<ElementaConfig>(
        elllPropertyKeys.elementaConfig,
      )?.url ?? "/elementa";
    this.iframe.onload = () => {
      (this.iframe.contentWindow as any)
        .init({
          stylesheetManager: this.stylesheetManager,
          host: this.host,
        })
        .then((editor: ElementaEditor) => {
          this.setElementaEditor(editor);
        });
    };

    const rootSubscription = this.elll.shell.workspace$
      .pipe(switchMap((workspace) => workspace?.root$ ?? of(undefined)))
      .subscribe((root) => {
        if (root) {
          root.appendChild(this.iframe);
        }
      });

    const urlSubscription = combineLatestOrEmpty([
      this.url$,
      this.elementa$,
    ]).subscribe(([url, elementa]) => {
      if (url) {
        const component = this.project.componentStore.component(url);
        elementa?.loadComponent(component);
      } else {
        elementa?.unloadComponent();
      }
    });

    this.addAction({
      name: "preview",
      icon: elllIcons16.play,
      action: () => {
        this.editorManager?.openPreview();
      },
    });

    this.addDisposer(() => {
      rootSubscription.unsubscribe();
      urlSubscription.unsubscribe();
      this.iframe.remove();
    });
  }

  setElementaEditor(editor: ElementaEditor | undefined) {
    editor?.setStyle({
      light: {
        background: "#fafafa",
        text: "#000",
        grid: "#8888",
        selection: "#08f",
      },
      dark: {
        background: "#25282c",
        text: "#fff",
        grid: "#8888",
        selection: "#08f",
      },
    });

    this._elementaEditor$.next(editor);
  }

  private _resizeObserver = new ResizeObserver((entry) => {
    const rect = entry[0].target.getBoundingClientRect();
    this._applyRect(rect);
  });
  private _applyRect = (rect: DOMRect) => {
    this.iframe.style.width = `${rect.width}px`;
    this.iframe.style.height = `${rect.height}px`;
    this.iframe.style.left = `${rect.x}px`;
    this.iframe.style.top = `${rect.y}px`;
  };
  mount(element: HTMLElement) {
    this.iframe.style.display = "block";
    this._applyRect(element.getBoundingClientRect());
    this._resizeObserver.observe(element);
  }
  unmount() {
    this.iframe.style.display = "none";
    this._resizeObserver.disconnect();
  }

  restore(data: ComponentEditorStateData): void {
    super.restore(data);
    if (data.elementa) {
      this.elementaEditor?.restore(data.elementa);
    }
  }
}

export const componentEditor: Editor = {
  id: editorId,
  createState: (shell) => new ComponentEditorState({ shell }),
  views: {
    board: editorViews.elementaBoard.id,
    context: editorViews.elementaContext.id,
    outline: editorViews.elementaOutline.id,
  },
};
