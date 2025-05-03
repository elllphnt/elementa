import { App } from "../../../app/app";
import { FileModel } from "../../file/model_file";

export abstract class AppManager {
  abstract app(url: string): FileModel<App>;
  abstract createApp(): Promise<FileModel<App>>;
}
