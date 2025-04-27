import { DataInputData } from "@elllphnt/elementa-base";
import { CRDTModel } from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";
import { Component } from "./component";

export class DataInput extends CRDTModel<DataInputData> {
  readonly component: Component;

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
  }

  get name(): string {
    return this.state.name ?? "";
  }
  get name$() {
    return this.state$.pipe(map((s) => s.name ?? ""));
  }

  get varName(): string | undefined {
    return this.state.varName;
  }
  get varName$() {
    return this.state$.pipe(map((s) => s.varName));
  }

  get tsType(): string | undefined {
    return this.state.tsType;
  }
  get tsType$() {
    return this.state$.pipe(map((s) => s.tsType));
  }

  get required(): boolean {
    return this.state.required ?? false;
  }
  get required$() {
    return this.state$.pipe(map((s) => s.required ?? false));
  }

  get defaultValue() {
    return this.state.default;
  }
  get defaultValue$() {
    return this.state$.pipe(map((s) => s.default));
  }

  setName(name: string) {
    this.ymap.set("name", name);
  }

  setVarName(varName: string | undefined) {
    if (varName === undefined) {
      this.ymap.delete("varName");
    } else {
      this.ymap.set("varName", varName);
    }
  }

  setTsType(tsType: string | undefined) {
    if (tsType === undefined) {
      this.ymap.delete("tsType");
    } else {
      this.ymap.set("tsType", tsType);
    }
  }

  setRequired(required: boolean) {
    this.ymap.set("required", required);
  }

  setDefault(defaultValue: any) {
    if (defaultValue === undefined) {
      this.ymap.delete("default");
    } else {
      this.ymap.set("default", defaultValue);
    }
  }

  remove() {
    this.component.props.remove(this);
  }
}
