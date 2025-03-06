import { SemanticComponentData } from "@elllphnt/elll-intelligence";
import { makeFidUrl } from "@elllphnt/utils";
import { File, parseElllResourceUrl } from "@repo/backend";
import { Component, Project } from "@repo/elementa";
import { map, Observable, of } from "rxjs";
import { Elll } from "../../../../elll/elll";
import { Persistor } from "../../../persitor";
import { nameFromPath } from "../../../utils";
import { realizeSemanticComponent } from "./realize";

export class ElllSemanticComponent extends Component {
  readonly elll: Elll;
  readonly file: File;
  readonly persitor: Persistor<SemanticComponentData>;

  get name(): string {
    const path = this.file.path;
    return path === undefined ? "" : nameFromPath(path);
  }
  get name$(): Observable<string> {
    return this.file.path$.pipe(
      map((path) => (path === undefined ? "" : nameFromPath(path))),
    );
  }

  get url(): string {
    const fileUrl = this.file.url;
    const { type } = parseElllResourceUrl(fileUrl);
    switch (type) {
      case "workspace-file":
        return makeFidUrl({ id: this.file.fid });
      default:
        return fileUrl;
    }
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

    this.persitor = new Persistor<SemanticComponentData>({
      elll: this.elll,
      resolveFile: () => this.file,
      resolveFile$: () => of(this.file),
    });

    // load the component data
    const dataSubscription = this.persitor.data$.subscribe((data) => {
      realizeSemanticComponent(this.id, data).then((realizedData) => {
        this.restore(realizedData);
      });
    });
    file.fetchContent();

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
    });
  }

  save() {}
}
