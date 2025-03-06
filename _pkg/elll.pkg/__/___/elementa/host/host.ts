import { ContextMenuOption, Handle, Host, PointData } from "@repo/elementa";
import { IElll } from "~/src/types/elll";
import { DragAndDropManager } from "./drag_and_drop_manager";
import { parseElllResourceUrl, WorkspaceFile } from "@repo/backend";
import { getEditorForFileType } from "~/src/libs/filetypes";
import { elllEntities, getUrlScheme } from "@elllphnt/utils";

export class ElementaHost extends Host {
  elll: IElll;
  window: Window;

  private _getIframe: () => HTMLElement;
  dragAndDropManager: DragAndDropManager;

  constructor({
    elll,
    getIframe,
  }: {
    elll: IElll;
    getIframe: () => HTMLElement;
  }) {
    super();
    this.elll = elll;
    this._getIframe = getIframe;
    this.window = window;
    this.dragAndDropManager = new DragAndDropManager({
      host: this,
      elll,
    });
  }

  // Navigation

  openWorkspaceFile(file: WorkspaceFile): void {
    const type = file.type;
    if (!type) return;

    const editorId = getEditorForFileType(type);
    if (!editorId) {
      this.elll.shell.toast({
        message: `No editor found for file type: ${type}`,
      });
      return;
    }

    this.elll.editorManager.openModel(editorId, file.url);
  }
  goToElllUrl(url: string): void {
    const { id } = parseElllResourceUrl(url);
    const resource = this.elll.backend.instance(id);
    if (!resource) return;

    switch (resource.entity) {
      case elllEntities.workspaceFile.name: {
        this.openWorkspaceFile(resource as WorkspaceFile);
        break;
      }
    }
  }
  goTo(url: string): void {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "elll": {
        this.goToElllUrl(url);
        break;
      }
    }
  }

  // Shell

  hideContextMenu(): void {
    this.elll.shell.hideContextMenu();
  }
  showContextMenu(position: PointData, options: ContextMenuOption[][]): void {
    const iframe = this._getIframe();
    const rect = iframe.getBoundingClientRect();
    this.elll.shell.showContextMenu({
      position: {
        x: position.x + rect.left,
        y: position.y + rect.top,
      },
      options,
    });
  }
  toast(message: string): void {
    this.elll.shell.toast({ message });
  }

  // Drag and Drop
  handleDragEnter(event: DragEvent, handle: Handle): void {
    this.dragAndDropManager.handleDragEnter(event, handle);
  }
  handleDragLeave(event: DragEvent, handle: Handle): void {
    this.dragAndDropManager.handleDragLeave(event, handle);
  }
  handleDrop(event: DragEvent, handle: Handle): void {
    this.dragAndDropManager.handleDrop(event, handle);
  }
  handleDragOver(event: DragEvent): void {
    this.dragAndDropManager.handleDragOver(event);
  }
}
