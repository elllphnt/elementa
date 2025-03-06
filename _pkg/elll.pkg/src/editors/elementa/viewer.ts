import { Router } from "@repo/elementa-renderer";
import { ElementaViewer } from "@repo/elementa-viewer";
import { Context, Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  of,
  switchMap,
} from "rxjs";
import { keys } from "~/src/libs/keys";
import {
  ComponentModel,
  componentModelConstructor,
} from "~/src/models/component";
import { IElll } from "~/src/types/elll";
import { boardViews } from "~/src/views/board/_";
import { editors } from "../_editors";
import { ModelEditorStateData } from "../model";
import { ElementaBaseEditorState } from "./elementa";
import { stylesheetManager } from "./libs/stylesheet_manager";

export type ComponentEditorStateData = ModelEditorStateData & {};

export class ElementaViewerState extends ElementaBaseEditorState<ComponentEditorStateData> {
  readonly modelConstructor = componentModelConstructor.name;
  readonly iframe: HTMLIFrameElement;

  private _contexts$ = new BehaviorSubject<Context[]>([]);

  get elementaViewer() {
    return this.elll.config<ElementaViewer>(
      keys.configs.editors.elementa.viewer,
    );
  }
  get elementaViewer$() {
    return this.elll.config$<ElementaViewer>(
      keys.configs.editors.elementa.viewer,
    );
  }

  get elementaRenderer() {
    return this.elementaViewer;
  }
  get elementaRenderer$() {
    return this.elementaViewer$;
  }

  get data(): ComponentEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ComponentEditorStateData> {
    return combineLatestOrEmpty([super._data$]).pipe(
      map(([superData]) => ({
        ...superData,
      })),
    );
  }

  get componentModel() {
    return this.model as ComponentModel | undefined;
  }
  get componentModel$() {
    return this.model$ as Observable<ComponentModel | undefined>;
  }

  get focused$() {
    return this.elll.shell.workspace$.pipe(
      switchMap((w) => w?.focusedEditor$ ?? of(undefined)),
      map((focused) => focused === this),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.componentViewer, shell });

    this.iframe = ElementaViewerState.getIframe(this.elll);

    const activationSubscription = combineLatest([
      this.elementaViewer$,
      this.focused$,
      this.componentModel$,
    ]).subscribe(([viewer, focused, component]) => {
      if (viewer && focused) {
        if (component) {
          viewer.elementa.loadComponent(component);
        } else {
          viewer.elementa.unloadComponent();
        }
      }
    });

    // load the component when ready
    const componentSubscription = combineLatest([
      this.elementaViewer$,
      this.componentModel$,
    ]).subscribe(([editor, component]) => {
      if (editor && component) {
        editor.elementa.loadComponent(component);
      }
    });

    this.watchRoot();

    this.addDisposer(() => {
      componentSubscription.unsubscribe();
      activationSubscription.unsubscribe();
      this.iframe.remove();
    });
  }

  static getIframe(elll: IElll) {
    let iframe = elll.config<HTMLIFrameElement | undefined>(
      keys.configs.editors.elementa.viewerIframe,
    );
    if (iframe) {
      return iframe;
    } else {
      const iframeUrl = elll.config<string>(keys.configs.elementa.viewerUrl);

      iframe = document.createElement("iframe");
      iframe.id = Math.random().toString(36).substring(7) + "";
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.display = "none";
      iframe.style.pointerEvents = "auto";
      iframe.src = iframeUrl ?? "/elementa/viewer";

      iframe.onload = async () => {
        const window = iframe!.contentWindow;
        const viewer: ElementaViewer = await (window as any).init({
          stylesheetManager,
          router: new Router(),
          infrastructure: elll.config(
            keys.configs.editors.elementa.infrastructure,
          ),
        });
        elll.setConfig(keys.configs.editors.elementa.viewer, viewer);
      };

      elll.setConfig(keys.configs.editors.elementa.viewerIframe, iframe);
      return iframe;
    }
  }

  get contexts(): Context[] {
    return this._contexts$.value;
  }
  get contexts$(): Observable<Context[]> {
    return this._contexts$.asObservable();
  }

  restore(data: ComponentEditorStateData): void {
    super.restore(data);
  }
}

export const componentViewer: Editor = {
  id: editors.componentViewer,
  createState: (shell) => new ElementaViewerState({ shell }),
  views: {
    board: boardViews.componentViewer.id,
    bar: boardViews.componentViewerBar.id,
  },
};
