import { Observable } from "rxjs";
import { App } from "../../../../app/_.js";
import { FileModelAdaptor } from "../../../../file/_.js";
import { BaseRenderableContent } from "./_base.js";

export interface AppRenderableContent extends BaseRenderableContent<"app"> {
  appUrl: string | undefined;
  appUrl$: Observable<string | undefined>;

  app: FileModelAdaptor<App> | undefined;
  app$: Observable<FileModelAdaptor<App> | undefined>;

  variables: Record<string, any> | undefined;
  variables$: Observable<Record<string, any> | undefined>;

  variableValue(name: string): any | undefined;
  variableValue$(name: string): Observable<any | undefined>;
}
