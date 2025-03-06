import { File } from "@repo/backend";
import { EditorState, EditorStateData, Project } from "@repo/elementa";
import { Observable, debounceTime, map, of } from "rxjs";
import { Elll } from "../../../elll/elll";
import { Persistor } from "../../persitor";
import { nameFromPath } from "../../utils";

export class ElllEditorState extends EditorState {
  readonly elll: Elll;
  readonly file: File;
  readonly persitor: Persistor<EditorStateData>;

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
    return this.persitor.loaded;
  }
  get loaded$() {
    return this.persitor.loaded$;
  }

  constructor({
    file,
    elll,
    project,
  }: {
    file: File;
    elll: Elll;
    project: Project;
  }) {
    super({ id: file.fid, project });
    this.elll = elll;
    this.file = file;

    this.persitor = new Persistor<EditorStateData>({
      elll: this.elll,
      resolveFile: () => this.file,
      resolveFile$: () => of(this.file),
    });

    // load the editorstate data
    const dataSubscription = this.persitor.data$.subscribe((data) => {
      this.restore(data);
    });
    // save the editorstate data
    const saveSubscription = this.data$
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.persitor.save(data);
      });

    if (!file.loaded && !file.fetchingContent) {
      file.fetchContent();
    }

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  save(): void {}
}
