import { File, Project } from "@elllphnt/elementa-models";
import { BehaviorSubject, map, Observable } from "rxjs";

export type LocalFileState = {
  name: string;
  type: string;
  content: string;
};

export class LocalFile extends File {
  readonly id: string;
  readonly project: Project;
  private _state$: BehaviorSubject<LocalFileState>;

  get url(): string {
    return `${this.project.url}:${this.id}`;
  }

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

  constructor({ id, project }: { id: string; project: Project }) {
    super();
    this.id = id;
    this.project = project;
    this._state$ = new BehaviorSubject<LocalFileState>({
      name: "",
      type: "js",
      content: "",
    });
  }

  getContent(): Promise<string> {
    return Promise.resolve(this._state$.value.content);
  }
  load(): Promise<void> {
    return Promise.resolve();
  }
}
