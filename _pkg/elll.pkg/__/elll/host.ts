import { Observable } from "rxjs";

export interface ElllHost {
  get userId(): string | undefined;
  get userId$(): Observable<string | undefined>;

  get tenantId(): string | undefined;
  get tenantId$(): Observable<string | undefined>;

  get workspaceId(): string | undefined;
  get workspaceId$(): Observable<string | undefined>;

  openWorkspace(workspaceId: string): void;
  closeWorkspace(): void;

  logout(): void;
}
