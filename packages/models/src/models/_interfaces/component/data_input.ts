import { Observable } from "rxjs";
import { Component } from "./component.js";

export interface DataInput {
  component: Component;

  name: string;
  name$: Observable<string>;

  varName: string | undefined;
  varName$: Observable<string | undefined>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;

  required: boolean;
  required$: Observable<boolean>;

  defaultValue: any;
  defaultValue$: Observable<any>;
}
