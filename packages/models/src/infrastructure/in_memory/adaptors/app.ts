import { AppData, appSchema } from "@elllphnt/elementa-base";
import { combineLatest } from "rxjs";
import { App, AppModel } from "~/models/_.js";
import { File } from "../../interfaces/file/file.js";
import { InMemoryFileModelAdaptor } from "./file_model.js";

export class InMemoryAppFileModelAdaptor extends InMemoryFileModelAdaptor<App> {
  constructor({ file }: { file: File }) {
    super({ file });

    const modelSubscription = combineLatest([
      this.file.isResolved$,
      this.file.content$,
    ]).subscribe(([isResolved, content]) => {
      if (isResolved && content) {
        try {
          const { data, error } = appSchema.safeParse(JSON.parse(content));
          if (error) {
            this.setError(error);
            this.setModel(undefined);
          } else {
            const app = new AppModel({
              init: data as AppData,
              file: this.file,
            });
            this.setModel(app);
          }
        } catch (error) {
          if (error instanceof Error) {
            this.setError(error as Error);
          } else {
            this.setError(new Error("Unknown error", { cause: error }));
          }
          this.setModel(undefined);
        }
      } else {
        this.setModel(undefined);
      }
    });

    this.addDisposer(() => {
      modelSubscription.unsubscribe();
    });
  }
}
