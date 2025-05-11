import { DataInputData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component, DataInput } from "../../_interfaces/_.js";

export function attachDataInput(
  input: y.Map<any>,
  component: Component
): input is y.Map<any> & DataInput {
  assert(attachReactiveMap<DataInputData>(input));

  assert(setObjectProperty(input, "component", component));
  assert(
    setReactiveMapGetters(input, [
      "name",
      "varName",
      "tsType",
      "required",
      "defaultValue",
    ])
  );

  const baseDispose = (input as any).dispose?.bind(input);
  (input as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<DataInput>(input, attachDataInput);
}
