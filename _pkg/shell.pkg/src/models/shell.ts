import { ContextMenuManager, IconStore, ViewStore } from "@repo/components";
import { PropertySet } from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, Observable, map } from "rxjs";
import { DragDropManager } from "./drag_drop_manager";
import { Editor } from "./editor";
import { ModalManager } from "./modal_manager";
import { NotificationManager } from "./notification_manager";
import { ToastManager } from "./toast_manager";
import { Workspace } from "./workspace";

export class Shell {
  readonly properties = new PropertySet();

  readonly contextMenuManager = new ContextMenuManager();
  readonly toastManager = new ToastManager();
  readonly notificationManager = new NotificationManager();
  readonly modalManager = new ModalManager();
  readonly dragDropManager = new DragDropManager();

  readonly iconStore = new IconStore();
  readonly viewStore = new ViewStore();

  private _workspace$ = new BehaviorSubject<Workspace | undefined>(undefined);
  private _editors$ = new BehaviorSubject<Record<string, Editor>>({});

  get workspace$() {
    return this._workspace$;
  }
  get workspace() {
    return this._workspace$.value;
  }

  editor(id: string) {
    return this._editors$.value[id] as Editor | undefined;
  }
  editor$(id: string) {
    return this._editors$.pipe(map((editors) => editors[id])) as Observable<
      Editor | undefined
    >;
  }

  loadWorkspace(workspace: Workspace) {
    // clear toasts, notifications, modals, etc
    this.toastManager.clear();
    this.notificationManager.clear();
    this.modalManager.clear();

    this._workspace$.next(workspace);
  }

  loadEditors(...editors: Editor[]) {
    const newEditors = { ...this._editors$.value };
    editors.forEach((e) => (newEditors[e.id] = e));
    this._editors$.next(newEditors);
  }
  unloadEditors(...editorKeys: string[]) {
    const newEditors = _.omit(this._editors$.value, editorKeys);
    this._editors$.next(newEditors);
  }
  unloadAllEditors() {
    this._editors$.next({});
  }
  createEditorState({ editorId, id }: { editorId: string; id?: string }) {
    const editor = this._editors$.value[editorId];
    if (!editor) {
      return;
    }
    return editor.createState(this, id);
  }

  // toasts
  toast = this.toastManager.toast.bind(this.toastManager);

  // notifications
  showNotification = this.notificationManager.showNotification.bind(
    this.notificationManager,
  );
  hideNotification = this.notificationManager.hideNotification.bind(
    this.notificationManager,
  );

  // modals
  showModal = this.modalManager.showModal.bind(this.modalManager);
  hideModal = this.modalManager.hideModal.bind(this.modalManager);

  // context menu
  showContextMenu = this.contextMenuManager.showMenu.bind(
    this.contextMenuManager,
  );
  hideContextMenu = this.contextMenuManager.hideMenu.bind(
    this.contextMenuManager,
  );
}
