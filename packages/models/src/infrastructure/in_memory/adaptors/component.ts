import { ComponentData, componentSchema } from "@elllphnt/elementa-base";
import { combineLatest } from "rxjs";
import { Component, ComponentModel } from "~/models/_.js";
import { File } from "../../interfaces/file/file.js";
import { InMemoryFileModelAdaptor } from "./file_model.js";

export class InMemoryComponentFileModelAdaptor extends InMemoryFileModelAdaptor<Component> {
  constructor({ file }: { file: File }) {
    super({ file });

    const modelSubscription = combineLatest([
      this.file.isResolved$,
      this.file.content$,
    ]).subscribe(([isResolved, content]) => {
      if (isResolved && content) {
        try {
          const { data, error } = componentSchema.safeParse(
            JSON.parse(content)
          );
          console.log("Parsed data", data);
          if (error) {
            this.setError(error);
            this.setModel(undefined);
          } else {
            const component = new ComponentModel({
              init: data as ComponentData,
              file: this.file,
            });
            this.setModel(component);
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
