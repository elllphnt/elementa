import { App } from "../../app/_";
import { FileModel } from "../_";
import { AppManager } from "../project/_";

export class InMemoryAppManager extends AppManager {
  app(url: string): FileModel<App> {
    throw new Error("Method not implemented.");
  }
  createApp(): Promise<FileModel<App>> {
    throw new Error("Method not implemented.");
  }
}
