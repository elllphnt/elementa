import { DataInputData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "./component";

export type DataInput = ReactiveMap<DataInputData> & {
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
};

/**
 * Attach DataInput behavior to a y.Map
 */
export function attachDataInput(
  ymap: y.Map<any>,
  component: Component
): ymap is DataInput {
  if (!attachReactiveMap<DataInputData>(ymap)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const input = ymap as DataInput;
  input.component = component;

  setModelFields(input, ["name", "varName", "tsType", "required", "default"]);

  setEnhancer(input, attachDataInput);
  return true;
}

/**
 * Create a new local DataInput
 */
export function createDataInput(component: Component): DataInput {
  const ymap = new y.Map<any>();
  if (!attachDataInput(ymap, component)) {
    throw new Error("Failed to create DataInput");
  }
  return ymap as DataInput;
}
