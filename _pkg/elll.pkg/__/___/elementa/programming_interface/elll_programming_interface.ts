import { map, of, switchMap } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";
import { ProgrammingInterface } from "./programming_interface";

const programmingInterfaceFilePath = ".elll/programming_interface";

export class ElllProgrammingInterface extends ProgrammingInterface {
  readonly project: ElllProject;

  get elll(): IElll {
    return this.project.elll;
  }

  get file() {
    return elllFileAtPath(this.elll, programmingInterfaceFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, programmingInterfaceFilePath, {
      type: mimeTypes.json,
    });
  }

  get model() {
    return this.file
      ? this.elll.modelManager.getModel(
          jsonModelConstructor.name,
          this.file.url,
        )
      : undefined;
  }
  get model$() {
    return this.file$.pipe(
      map((file) =>
        file
          ? this.elll.modelManager.getModel(jsonModelConstructor.name, file.url)
          : undefined,
      ),
    );
  }

  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => (model ? model.content.data$ : of({}))),
    );
  }
  get contentData() {
    return this.model?.content.data ?? {};
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    let syncing = false;
    // Restore data
    const restoreSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }
}
