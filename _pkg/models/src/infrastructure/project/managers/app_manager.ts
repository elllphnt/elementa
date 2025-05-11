import { App } from "../../../app/app.js";
import { ModelFile } from "../../file/model_file.js";

export abstract class AppManager {
  abstract app(url: string): ModelFile<App>;
  abstract createApp(): Promise<ModelFile<App>>;
}
