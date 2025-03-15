import { elllFileTypes, switchFileType } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { filter, firstValueFrom } from "rxjs";
import { ComponentModel, componentModelConstructor } from "../models/component";
import { IElll } from "../types/elll";

export async function initFile(elll: IElll, file: File) {
  if (!file.type) {
    console.error("File not loaded with type");
    return;
  }

  await switchFileType(file.type, {
    [elllFileTypes.component]: async () => {
      const model = elll.modelManager.getModel(
        componentModelConstructor.name,
        file.url,
      ) as ComponentModel;
      await firstValueFrom(model.loaded$.pipe(filter(Boolean)));
    },
  });
}
