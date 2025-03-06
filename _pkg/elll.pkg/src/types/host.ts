import { Observable } from "rxjs";

export interface ElllHost {
  get userId(): string | undefined;
  get userId$(): Observable<string | undefined>;

  get tenantId(): string | undefined;
  get tenantId$(): Observable<string | undefined>;

  get repositoryId(): string | undefined;
  get repositoryId$(): Observable<string | undefined>;

  openProject(repositoryId: string): void;
  closeProject(): void;

  logout(): void;
}
