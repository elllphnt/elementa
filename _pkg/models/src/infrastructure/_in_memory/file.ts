import { BehaviorSubject, map, Observable } from "rxjs";
import { File } from "../file/_";
import { ResourceStatus } from "../resource";
import { InMemoryProject } from "./project";
import { InMemoryInfrastructure } from "./infrastructure";

export type InMemoryFileState = {
  name: string;
  type: string;
  content: string;
};

export class InMemoryFile extends File {
  readonly id: string;
  readonly project: InMemoryProject;

  get url(): string {
    return InMemoryInfrastructure.makeAbsoluteFileUrl(this.project.id, this.id);
  }

  private _state$: BehaviorSubject<InMemoryFileState>;

  get name(): string {
    return this._state$.value.name;
  }
  get name$(): Observable<string> {
    return this._state$.asObservable().pipe(map((state) => state.name));
  }
  get type(): string {
    return this._state$.value.type;
  }
  get type$(): Observable<string> {
    return this._state$.asObservable().pipe(map((state) => state.type));
  }
  get content(): string {
    return this._state$.value.content;
  }
  get content$(): Observable<string> {
    return this._state$.asObservable().pipe(map((state) => state.content));
  }

  constructor({
    id,
    initialState,
    project,
  }: {
    id: string;
    initialState: InMemoryFileState;
    project: InMemoryProject;
  }) {
    super();
    this.project = project;
    this._state$ = new BehaviorSubject<InMemoryFileState>(initialState);
    this.setStatus(ResourceStatus.Resolved);
  }

  getContent(): Promise<string> {
    return Promise.resolve(this._state$.value.content);
  }
  load(): Promise<void> {
    return Promise.resolve();
  }
  unload(): Promise<void> {
    return Promise.resolve();
  }
}
