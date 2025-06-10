import { AppData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { App } from "~/models/_.js";
import { File } from "~/project/_.js";
import { BaseModel } from "../_base.js";

export class AppModel extends BaseModel<AppData> implements App {
  get data(): AppData {
    throw new Error("Method not implemented.");
  }
  get data$(): Observable<AppData> {
    throw new Error("Method not implemented.");
  }
  restore(data: AppData): void {
    throw new Error("Method not implemented.");
  }
  constructor({ init, file }: { init: AppData; file: File }) {
    super();
  }
}
