import { Observable } from "rxjs";
import { Identifiable } from "../../_shared/identifiable.js";
import { Component } from "../component.js";

export interface State extends Identifiable {
  component: Component;
  type: string;
  name: string | undefined;
  name$: Observable<string | undefined>;
  varName: string | undefined;
  varName$: Observable<string | undefined>;
}
