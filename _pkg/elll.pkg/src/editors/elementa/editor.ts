import { entityTypeMatch, entityTypes } from "@elllphnt/elll-element";
import { elllIcons16 } from "@repo/components";
import {
  defaultCommandMap,
  defaultKeymap,
  EntityHandle,
  FrameWidgetHandle,
  IHandle,
} from "@repo/elementa-interactor";
import { ElementaStageManager, ElementaStager } from "@repo/elementa-stager";
import { Context, Editor, Shell } from "@repo/shell";
import { combineLatestOrEmpty, pairwiseOrEmpty } from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { keys } from "~/src/libs/keys";
import {
  ComponentModel,
  componentModelConstructor,
} from "~/src/models/component";
import { ElementaHost } from "~/src/modules/elementa/host/host";
import { IElll } from "~/src/types/elll";
import { boardViews } from "~/src/views/board/_";
import { outlineViews } from "~/src/views/outlines/_";
import { ElementaInteractor } from "../../../../elementa-interactor.pkg/dist";
import { editors } from "../_editors";
import {
  ElementaBaseEditorState,
  ElementaBaseEditorStateData,
} from "./elementa";
import { stylesheetManager } from "./libs/stylesheet_manager";
import { stagerTheme } from "./libs/theme";
import { ElementaViewerState } from "./viewer";

export type ComponentEditorStateData = ElementaBaseEditorStateData & {};
type ContextWithEnabler = Context & {
  enabled?: (selection: IHandle[]) => boolean;
  enabled$?: (selection$: Observable<IHandle[]>) => Observable<boolean>;
};
const propertiesContext: ContextWithEnabler = {
  id: "elll.editor.component.context.properties",
  name: "Properties",
  icon: elllIcons16.properties,
  panel: {
    viewId: keys.views.properties,
  },
  priority: 90,
  enabled$: (selection$) =>
    selection$.pipe(
      map(
        (selection) =>
          (!!selection.length &&
            selection.every(
              (handle) =>
                handle instanceof EntityHandle &&
                entityTypeMatch(handle.entity.type, entityTypes.widgets.frame),
            )) ||
          selection.every(
            (handle) =>
              handle instanceof EntityHandle &&
              entityTypeMatch(handle.entity.type, entityTypes.element),
          ),
      ),
    ),
  enabled: (selection) => {
    return (
      !!selection.length &&
      selection.every(
        (handle) =>
          handle instanceof EntityHandle &&
          entityTypeMatch(handle.entity.type, entityTypes.element),
      )
    );
  },
};
const styleContext: ContextWithEnabler = {
  id: "elll.editor.component.context.style",
  name: "Style",
  icon: elllIcons16.stylesheet,
  panel: {
    viewId: keys.views.stylesheet,
  },
  priority: 100,
  enabled$: (selection$) =>
    selection$.pipe(
      switchMap((selection) => {
        if (!selection.length) {
          return of(false);
        } else {
          return combineLatestOrEmpty(
            selection.map((handle) => {
              if (!(handle instanceof EntityHandle)) {
                return of(false);
              } else {
                if (entityTypeMatch(handle.entity.type, entityTypes.element)) {
                  return of(true);
                } else if (
                  entityTypeMatch(handle.entity.type, entityTypes.widgets.frame)
                ) {
                  return (handle as FrameWidgetHandle).entity.viewport$.pipe(
                    map(Boolean),
                  );
                } else {
                  return of(false);
                }
              }
            }),
          ).pipe(map((values) => values.every(Boolean)));
        }
      }),
    ),
  enabled: (selection) => {
    if (!selection.length) {
      return false;
    } else {
      return selection.every((handle) => {
        if (!(handle instanceof EntityHandle)) {
          return false;
        } else {
          if (entityTypeMatch(handle.entity.type, entityTypes.element)) {
            return true;
          } else if (
            entityTypeMatch(handle.entity.type, entityTypes.widgets.frame)
          ) {
            return (handle as FrameWidgetHandle).entity.viewport !== undefined;
          } else {
            return false;
          }
        }
      });
    }
  },
};
const consoleContext: ContextWithEnabler = {
  id: "elll.editor.component.context.console",
  name: "Console",
  icon: elllIcons16.aspectRatio,
  panel: {
    viewId: keys.views.console,
  },
  priority: 110,
};

export class ElementaEditorState extends ElementaBaseEditorState<ComponentEditorStateData> {
  readonly modelConstructor = componentModelConstructor.name;
  readonly iframe: HTMLIFrameElement;

  private _contexts = [propertiesContext, styleContext, consoleContext];

  private _stageKey$ = new BehaviorSubject<number | undefined>(undefined);
  private _elementaStager$ = new BehaviorSubject<ElementaStager | undefined>(
    undefined,
  );
  private _elementaInteractor$ = new BehaviorSubject<
    ElementaInteractor | undefined
  >(undefined);
  private _rect$ = new BehaviorSubject<DOMRect | undefined>(undefined);

  get elementaStager() {
    return this._elementaStager$.value;
  }
  get elementaStager$() {
    return this._elementaStager$.asObservable();
  }

  get elementaRenderer() {
    return this.elementaStager;
  }
  get elementaRenderer$() {
    return this.elementaStager$;
  }

  get elementaInteractor() {
    return this._elementaInteractor$.value;
  }
  get elementaInteractor$() {
    return this._elementaInteractor$.asObservable();
  }

  get data(): ComponentEditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<ComponentEditorStateData> {
    return combineLatestOrEmpty([
      super._data$,
      // this.elementaEditor$.pipe(
      //   switchMap((editor) => editor?.data$ ?? of(undefined)),
      // ),
    ]).pipe(
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

  get manager() {
    return this.elll.config<ElementaStageManager>(
      keys.configs.editors.elementa.stageManager,
    );
  }
  get manager$() {
    return this.elll.config$<ElementaStageManager>(
      keys.configs.editors.elementa.stageManager,
    );
  }

  get active() {
    return this.elll.shell.workspace?.activeEditor === this;
  }
  get active$() {
    return this.elll.shell.workspace$.pipe(
      switchMap((w) => w?.activeEditor$ ?? of(undefined)),
      map((active) => active === this),
    );
  }

  constructor({ id, shell }: { id?: string; shell: Shell }) {
    super({ id, editorId: editors.componentEditor, shell });

    this.iframe = ElementaEditorState.getIframe(this.elll);

    const managerSubscription = this.manager$.subscribe((manager) => {
      if (manager) {
        this.handleManager(manager);
      }
    });

    const activationSubscription = combineLatest([
      this.manager$,
      this._stageKey$,
      this.active$,
    ]).subscribe(([manager, stageId, active]) => {
      console.log("activation", this.key, active, stageId, manager);
      if (manager && active && stageId !== undefined) {
        manager.activateStage(stageId);
      } else if (stageId !== undefined) {
        manager?.deactivateStage(stageId);
      }
    });

    this.addAction({
      icon: elllIcons16.play,
      name: "Preview",
      action: () => {
        const previewEditor = this.getPreviewEditor();
        previewEditor.setUrl(this.url);
        this.elll.editorManager.focusedEditor(previewEditor);
      },
    });

    const rootSubscription = this.elll.shell.workspace$
      .pipe(switchMap((workspace) => workspace?.root$ ?? of(undefined)))
      .subscribe((root) => {
        if (root) {
          root.appendChild(this.iframe);
        }
      });

    // load the component when ready
    const componentSubscription = combineLatest([
      this.elementaStager$,
      this.componentModel$,
    ]).subscribe(([editor, component]) => {
      console.log("editor-component", component?.name, editor, component);
      if (editor && component) {
        editor.elementa.loadComponent(component);
      }
    });

    // create editor when stager is ready
    const stagerSubscription = this.elementaStager$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (next) {
          const editor = new ElementaInteractor({
            stager: next,
            host: new ElementaHost({
              elll: this.elll,
            }),
          });

          // load commands
          Object.entries(defaultCommandMap).forEach(([key, handler]) => {
            editor.commandManager.register(key, handler);
          });
          // set keymap
          defaultKeymap.forEach((keymap) => {
            editor.keyboardManager.keyMapper.set(keymap);
          });

          this._elementaInteractor$.next(editor);
        } else {
          this._elementaInteractor$.next(undefined);
        }

        if (prev) {
          prev.dispose();
        }
      });

    const rectSubscription = combineLatestOrEmpty([
      this._rect$,
      this.elementaInteractor$,
    ]).subscribe(([rect, interactor]) => {
      if (rect && interactor) {
        interactor.interface.setStagerRect({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        interactor.interface.setPosition(rect.x, rect.y);
        interactor.interface.setSize(rect.width, rect.height);
      }
    });

    this.watchRoot();

    this.addDisposer(() => {
      rootSubscription.unsubscribe();
      componentSubscription.unsubscribe();
      rectSubscription.unsubscribe();
      stagerSubscription.unsubscribe();
      activationSubscription.unsubscribe();
      managerSubscription.unsubscribe();
    });
  }

  async handleManager(manager: ElementaStageManager) {
    const [stager, key] = manager.createStage();
    this._stageKey$.next(key);
    this._elementaStager$.next(stager);
  }

  static getIframe(elll: IElll) {
    let iframe = elll.config<HTMLIFrameElement | undefined>(
      keys.configs.editors.elementa.editorIframe,
    );
    if (iframe) {
      return iframe;
    } else {
      const iframeUrl = elll.config<string>(keys.configs.elementa.editorUrl);

      iframe = document.createElement("iframe");
      iframe.id = Math.random().toString(36).substring(7) + "";
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.display = "none";
      iframe.style.pointerEvents = "auto";
      iframe.src = iframeUrl ?? "/elementa/editor";

      iframe.onload = async () => {
        const window = iframe!.contentWindow;
        const manager: ElementaStageManager = await (window as any).init({
          stylesheetManager,
          theme: stagerTheme,
          infrastructure: elll.config(
            keys.configs.editors.elementa.infrastructure,
          ),
        });
        elll.setConfig(keys.configs.editors.elementa.stageManager, manager);
      };

      elll.setConfig(keys.configs.editors.elementa.editorIframe, iframe);
      return iframe;
    }
  }

  getPreviewEditor() {
    const key = "elll.editor.component.preview";
    let editor = this.elll.config(key);
    if (!editor) {
      editor = new ElementaViewerState({ shell: this.shell });
      this.elll.setConfig(key, editor);
    }
    return editor as ElementaViewerState;
  }

  get contexts(): Context[] {
    return this._contexts.filter(
      (context) =>
        context.enabled?.(
          this.elementaInteractor?.interactionManager.selection ?? [],
        ) ?? true,
    );
  }
  get contexts$(): Observable<Context[]> {
    return this.elementaInteractor$.pipe(
      switchMap((interactor) => {
        return combineLatest(
          this._contexts.map((context) =>
            (
              context.enabled$?.(
                interactor?.interactionManager.selection$ ?? of([]),
              ) ?? of(true)
            ).pipe(map((enabled) => ({ context, enabled }))),
          ),
        );
      }),
      map((values) =>
        values.filter((value) => value.enabled).map((v) => v.context),
      ),
    );
  }

  protected _applyRect(rect: DOMRect): void {
    super._applyRect(rect);
    this._rect$.next(rect);
  }
  restore(data: ComponentEditorStateData): void {
    super.restore(data);
    // if (data.elementa) {
    //   const elmentaData = data.elementa;
    //   firstValueFrom(
    //     this.elementaEditor$.pipe(filter(Boolean), timeout(10000)),
    //   ).then((editor) => {
    //     editor.restore(elmentaData);
    //   });
    // }
  }
}

export const componentEditor: Editor = {
  id: editors.componentEditor,
  createState: (shell) => new ElementaEditorState({ shell }),
  views: {
    board: boardViews.componentEditor.id,
    outline: outlineViews.componentEditor.id,
  },
};
