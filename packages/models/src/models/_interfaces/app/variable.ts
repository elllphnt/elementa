import { Observable } from "rxjs";
import { App } from "./app.js"; // use updated App type

export interface AppVariable {
  app: App;

  varName: string | undefined;
  varName$: Observable<string | undefined>;

  name: string | undefined;
  name$: Observable<string | undefined>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;

  scope: string | undefined;
  scope$: Observable<string | undefined>;

  description: string | undefined;
  description$: Observable<string | undefined>;
}
