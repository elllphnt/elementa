import { map, Observable } from "rxjs";
import { makeFileUrl } from "~/_lib/url.js";
import { Project } from "../project.js";
import { AsyncResource } from "../resource.js";

export function extractNameFromPath(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export abstract class File extends AsyncResource {
  id: string;

  project: Project;
  get url() {
    return makeFileUrl({
      fileId: this.id,
      projectId: this.project.id,
    });
  }

  abstract get path(): string | undefined;
  abstract get path$(): Observable<string | undefined>;

  get name() {
    if (this.path === undefined) {
      return undefined;
    }
    return extractNameFromPath(this.path);
  }
  get name$() {
    return this.path$.pipe(
      map((path) => {
        if (path === undefined) {
          return undefined;
        }
        return extractNameFromPath(path);
      })
    );
  }

  get content() {
    return this.project.content(this.id);
  }

  constructor({ id, project }: { id: string; project: Project }) {
    super();

    this.id = id;
    this.project = project;
  }
}

export class FileReference<F extends File> extends AsyncResource {
  path: string;
  project: Project<F>;

  get file(): File | undefined {
    return this.project.fileAtPath(this.path);
  }
  get file$(): Observable<File | undefined> {
    return this.project.fileAtPath$(this.path);
  }

  constructor({ project, path }: { project: Project<F>; path: string }) {
    super();

    this.path = path;
    this.project = project;
  }

  async initialize(): Promise<void> {
    this.setInitialized();
  }
}
