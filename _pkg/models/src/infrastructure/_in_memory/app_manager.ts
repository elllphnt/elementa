import { App } from "../../app/_";
import { ModelFile } from "../_";
import { AppManager } from "../project/_";

export class InMemoryAppManager extends AppManager {
  app(url: string): ModelFile<App> {
    throw new Error("Method not implemented.");
  }
  createApp(): Promise<ModelFile<App>> {
    throw new Error("Method not implemented.");
  }
}
