import {
  Route,
  RouteMap,
  Router,
  createRouterFromJsonMap,
} from "@elllphnt/elll-router";
import { makeFidUrl } from "@elllphnt/utils";
import { ElementaViewer } from "@repo/elementa";
import { Editor, EditorState, Shell } from "@repo/shell";
import { combineLatestOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  of,
  switchMap,
} from "rxjs";
import { IElll } from "~/src/elll/_types";
import { elllPropertyKeys } from "~/src/elll/property_keys";
import { ElementaConfig } from "~/src/elll/setup";
import { ContentEditorStateData } from "../content";
import { stylesheetManager } from "./libs/globals";

const editorId = "elll.editor.preview";

export type PreviewEditorStateData = ContentEditorStateData & {};

type FilePageRoute = Route & {
  fid: string;
};

export class PreviewEditorState extends EditorState<PreviewEditorStateData> {
  readonly shell: Shell;
  readonly iframe: HTMLIFrameElement;
  get stylesheetManager() {
    return stylesheetManager;
  }

  private _elementaEditor$ = new BehaviorSubject<ElementaViewer | undefined>(
    undefined,
  );
  private _router$ = new BehaviorSubject<Router>(
    createRouterFromJsonMap({
      type: "directory",
      path: "",
    }),
  );
  private _path$ = new BehaviorSubject<string>("/");

  get elll() {
    const elll = this.shell.properties.value<IElll>("elll");
    if (!elll) throw new Error("Elll not found in shell properties");
    return elll;
  }

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

  get path() {
    return this._path$.value;
  }
  get path$() {
    return this._path$.asObservable();
  }

  get router() {
    return this._router$.value;
  }
  get router$() {
    return this._router$.asObservable();
  }

  allPageFilesQuery(workspaceId: string) {
    return this.elll.backend.workspaceFileStore.query({
      key: `workspace-all-page-files-${workspaceId}`,
      resolve$: (files$) => {
        return files$.pipe(
          switchMap((files) =>
            combineLatestOrEmpty(
              files.map((f) =>
                combineLatestOrEmpty([f.path$, f.type$]).pipe(
                  map(([path, type]) => ({ path, type, file: f })),
                ),
              ),
            ),
          ),
          map((files) => files.filter((f) => f.path?.startsWith("pages/"))),
          map((files) => files.map((f) => f.file)),
        );
      },
      resolve: (files) => {
        return files.filter((f) => f.path?.startsWith("pages/"));
      },
      fetch: async () => {
        await this.elll.backend.repositoryService.fetchWorkspaceFiles({
          workspaceId,
          path: "pages",
        });
      },
    });
  }

  get allPageFiles() {
    const workspaceId = this.elll.workspace?.id;
    if (!workspaceId) return [];
    return this.allPageFilesQuery(workspaceId).data;
  }
  get allPageFiles$() {
    return this.elll.workspace$.pipe(
      switchMap((workspace) => {
        if (!workspace) return of([]);
        return this.allPageFilesQuery(workspace.id).data$;
      }),
    );
  }

  get title() {
    return this.path ?? "Preview";
  }
  get title$() {
    return this.path$.pipe(map((path) => path ?? "Preview"));
  }

  get icon() {
    return {
      name: "eye",
      color: "#08f",
    };
  }
  get icon$() {
    return of(this.icon);
  }

  get data(): PreviewEditorStateData {
    return {
      id: this.id,
      editorId: this.editorId,
    };
  }
  get data$(): Observable<PreviewEditorStateData> {
    return of({
      id: this.id,
      editorId: this.editorId,
    });
  }

  get project(): ElllProject {
    return this.elll.project;
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({
      id,
      editorId,
    });
    this.shell = shell;

    // init router
    const initSubscription = this.elementaEditor$.subscribe(
      (elementaEditor) => {
        elementaEditor?.router.push("/");
      },
    );

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
          router: this.router,
          mode: "preview",
        })
        .then((editor: ElementaViewer) => {
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

    const pathSubscription = combineLatest([
      this.path$,
      this.router$,
      this.elementa$,
    ]).subscribe(([path, router, elementa]) => {
      const route = router.match(path) as FilePageRoute;

      if (route) {
        const component = this.project.componentStore.component(
          makeFidUrl({ id: route.fid }),
        );
        elementa?.loadComponent(component);
      } else {
        elementa?.unloadComponent();
      }
    });

    const pagesSubscription = this.allPageFiles$
      .pipe(
        switchMap((pages) =>
          combineLatestOrEmpty(
            pages.map((page) =>
              page.path$.pipe(map((path) => [path, page.fid])),
            ),
          ),
        ),
        map(
          (pages) =>
            pages.filter(([path]) => Boolean(path)) as Array<[string, string]>,
        ),
        map((pages) => pages.map(([path, fid]) => ({ path, fid }))),
      )
      .subscribe((pages) => {
        const router = this.makeRouter(pages);
        this._router$.next(router);
      });

    this.addDisposer(() => {
      pathSubscription.unsubscribe();
      pagesSubscription.unsubscribe();
      initSubscription.unsubscribe();
      rootSubscription.unsubscribe();
    });
  }

  makeRouter(
    pages: Array<{
      path: string;
      fid: string;
    }>,
  ): Router {
    const routMap = new RouteMap();
    for (const page of pages) {
      const path = page.path.replace(/^pages\//, "");
      routMap.addRoute(path, {
        type: "file",
        fid: page.fid,
      } as FilePageRoute);
    }
    return createRouterFromJsonMap(routMap.data);
  }

  setElementaEditor(editor: ElementaViewer | undefined) {
    this._elementaEditor$.next(editor);
  }

  setPath(path: string) {
    this._path$.next(path);
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

  restore(data: PreviewEditorStateData): void {}
  restoreDiff(data: Partial<PreviewEditorStateData>): void {}
}

export const previewEditor: Editor = {
  id: editorId,
  createState: (shell) => new PreviewEditorState({ shell }),
  views: {
    board: editorViews.previewBoard.id,
    bar: editorViews.previewBar.id,
  },
};
