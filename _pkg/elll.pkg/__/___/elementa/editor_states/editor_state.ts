import { File } from "@repo/backend";
import { EditorState, Project } from "@repo/elementa";
import { Observable, debounceTime, map } from "rxjs";
import { IElll } from "~/src/types/elll";
import { nameFromPath } from "../_utils";

export class ElllEditorState extends EditorState {
  readonly elll: IElll;
  readonly file: File;

  get model() {
    return this.elll.modelManager.getModel(this.file.url, "json");
  }

  get name(): string {
    const path = this.file.path;
    return path === undefined ? "" : nameFromPath(path);
  }
  get name$(): Observable<string> {
    return this.file.path$.pipe(
      map((path) => (path === undefined ? "" : nameFromPath(path))),
    );
  }

  get loaded() {
    return this.model.content.loaded;
  }
  get loaded$() {
    return this.model.content.loaded$;
  }

  get contentData$() {
    return this.model.content.data$;
  }
  get contentData() {
    return this.model.content.data;
  }

  constructor({
    file,
    elll,
    project,
  }: {
    file: File;
    elll: IElll;
    project: Project;
  }) {
    super({ id: file.id, project });
    this.elll = elll;
    this.file = file;

    let syncing = false;
    // load the editorstate data
    const dataSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // save the editorstate data
    const saveSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.model.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }
}
