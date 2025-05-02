import { App } from "../../../app/app";
import { ModelFile } from "../../file/model_file";

export abstract class AppManager {
  abstract app(url: string): ModelFile<App>;
  abstract createApp(): Promise<ModelFile<App>>;
}
