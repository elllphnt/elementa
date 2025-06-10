import { Observable } from "rxjs";
import { Identifiable } from "../../_shared/identifiable.js";
import { Component } from "../component.js";

export interface BaseState<T extends string> extends Identifiable {
  type: T;
  component: Component;
  name: string | undefined;
  name$: Observable<string | undefined>;
  varName: string | undefined;
  varName$: Observable<string | undefined>;
}
