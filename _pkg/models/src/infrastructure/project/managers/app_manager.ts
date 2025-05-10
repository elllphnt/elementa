import { App } from "../../../app/app.js";
import { FileModel } from "../../file/model_file.js";

export abstract class AppManager {
  abstract app(url: string): FileModel<App>;
  abstract createApp(): Promise<FileModel<App>>;
}
