import { ValueStateData } from "@elllphnt/elementa-base";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { State } from "./state";

export class ValueState extends State<ValueStateData> {
  get initialValue() {
    return this.state.init;
  }
  get initialValue$() {
    return this.state$.pipe(map((s) => s.init));
  }

  get tsType() {
    return this.state.tsType;
  }
  get tsType$() {
    return this.state$.pipe(map((s) => s.tsType));
  }

  get data(): ValueStateData {
    return this.state;
  }
  get data$() {
    return this.state$;
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap, component);
  }

  setInitialValue(value: any) {
    this.patch({ init: value });
  }
  setTsType(tsType: string | undefined) {
    this.patch({ tsType });
  }
  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }
}
