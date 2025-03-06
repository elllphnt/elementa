import { ElllBackend, Workspace } from "@repo/backend";
import { Shell } from "@repo/shell";
import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";
import { ContentManager } from "../libs/content/content_manager";
import { EditorManager } from "../libs/editor_manager";
import { ElllProject } from "../libs/project/project";
import Room from "../libs/room";
import { TSVirtualFileSystem } from "../libs/typescript/tsvfs";
import { Navigation } from "./navigation";

export interface IElll extends Disposable {
  readonly shell: Shell;
  readonly backend: ElllBackend;
  readonly editorManager: EditorManager;
  readonly contentManager: ContentManager;
  readonly tsvfs: TSVirtualFileSystem;
  readonly project: ElllProject;
  readonly navigation: Navigation<string>;

  readonly userId: string | undefined;
  readonly userId$: Observable<string | undefined>;

  readonly workspaceId: string | undefined;
  readonly workspaceId$: Observable<string | undefined>;

  readonly workspace: Workspace | undefined;
  readonly workspace$: Observable<Workspace | undefined>;

  readonly room: Room | undefined;
  readonly room$: Observable<Room | undefined>;

  readonly properties: Shell["properties"];

  fileAtPath(path: string, create?: { type: string }): any;
  fileAtPath$(path: string, create?: { type: string }): Observable<any>;

  init(): Promise<void>;
  render(dom: HTMLElement): void;
}
