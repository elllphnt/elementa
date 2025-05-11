import { Observable } from "rxjs";
import { Component } from "../component.js";
import { Identifiable } from "../identifiable.js";

export interface State extends Identifiable {
  component: Component;
  type: string;
  name: string | undefined;
  name$: Observable<string | undefined>;
  varName: string | undefined;
  varName$: Observable<string | undefined>;
  remove(): void;
}
