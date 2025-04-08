import { ElllBackend, Repository, Tenant } from "@repo/backend";
import { User } from "@repo/backend/dist/resources/user";
import { Shell } from "@repo/shell";
import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";
import { ContentManager } from "../modules/elll/content/manager";
import { Copilot } from "../modules/elll/copilot/copilot";
import { EditorManager } from "../modules/elll/editor/manager";
import { ModelManager } from "../modules/elll/model/manager";
import { Room } from "../modules/elll/room/room";
import { ElllHost } from "./host";

export interface IElll extends Disposable {
  readonly shell: Shell;
  readonly host: ElllHost;
  readonly backend: ElllBackend;
  readonly contentManager: ContentManager;
  readonly modelManager: ModelManager;
  readonly editorManager: EditorManager;
  readonly copilot: Copilot;

  readonly user: User | undefined;
  readonly user$: Observable<User | undefined>;

  readonly tenant: Tenant | undefined;
  readonly tenant$: Observable<Tenant | undefined>;

  readonly repository: Repository | undefined;
  readonly repository$: Observable<Repository | undefined>;

  readonly room: Room | undefined;
  readonly room$: Observable<Room | undefined>;

  config<T>(key: string): T | undefined;

  property<T>(key: string): T | undefined;
  property$<T>(key: string): Observable<T | undefined>;

  // readonly properties: Shell["properties"];

  setProperty(key: string, value: any): void;
  setConfig(key: string, value: any): void;
  render(dom: HTMLElement): void;
}
