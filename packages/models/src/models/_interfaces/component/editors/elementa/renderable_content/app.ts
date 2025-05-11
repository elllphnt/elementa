import { Observable } from "rxjs";
import { App } from "../../../../app/_.js";
import { FileModel } from "../../../../file/_.js";

export interface AppRenderableContent {
  type: "app";

  appUrl: string | undefined;
  appUrl$: Observable<string | undefined>;

  app: FileModel<App> | undefined;
  app$: Observable<FileModel<App> | undefined>;

  variables: Record<string, any>;
  variables$: Observable<Record<string, any>>;

  variableValue(name: string): any | undefined;
  variableValue$(name: string): Observable<any | undefined>;
}
