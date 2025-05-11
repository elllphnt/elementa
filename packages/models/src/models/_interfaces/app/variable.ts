import { Observable } from "rxjs";
import { App } from "./app.js"; // use updated App type

export interface AppVariable {
  app: App;

  varName: string;
  varName$: Observable<string>;

  name: string;
  name$: Observable<string>;

  tsType: string;
  tsType$: Observable<string>;

  scope: string | undefined;
  scope$: Observable<string | undefined>;

  description: string | undefined;
  description$: Observable<string | undefined>;
}
