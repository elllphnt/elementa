import { DataInputData } from "@elllphnt/elementa-base";
import { attachReactiveMap, Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "./component";

export type DataInputModel = ReturnType<
  typeof attachReactiveMap<DataInputData>
> & {
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

  setName(name: string): void;
  setVarName(varName: string | undefined): void;
  setTsType(tsType: string | undefined): void;
  setRequired(required: boolean): void;
  setDefault(defaultValue: any): void;

  remove(): void;
};

/**
 * Attach DataInput behavior to a y.Map
 */
export function withDataInputBehavior(
  ymap: y.Map<any>,
  component: Component
): DataInputModel {
  const input = attachReactiveMap<DataInputData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<DataInputModel>;

  input.component = component;

  Object.defineProperty(input, "name", {
    get() {
      return input.value.name ?? "";
    },
    set(value) {
      input.set("name", value);
    },
  });

  input.name$ = input.observable$.pipe(
    map((v) => v.name ?? ""),
    distinctUntilChanged()
  );

  Object.defineProperty(input, "varName", {
    get() {
      return input.value.varName;
    },
    set(value) {
      if (value === undefined) {
        input.delete("varName");
      } else {
        input.set("varName", value);
      }
    },
  });

  input.varName$ = input.observable$.pipe(
    map((v) => v.varName),
    distinctUntilChanged()
  );

  Object.defineProperty(input, "tsType", {
    get() {
      return input.value.tsType;
    },
    set(value) {
      if (value === undefined) {
        input.delete("tsType");
      } else {
        input.set("tsType", value);
      }
    },
  });

  input.tsType$ = input.observable$.pipe(
    map((v) => v.tsType),
    distinctUntilChanged()
  );

  Object.defineProperty(input, "required", {
    get() {
      return input.value.required ?? false;
    },
    set(value) {
      input.set("required", value);
    },
  });

  input.required$ = input.observable$.pipe(
    map((v) => v.required ?? false),
    distinctUntilChanged()
  );

  Object.defineProperty(input, "defaultValue", {
    get() {
      return input.value.default;
    },
    set(value) {
      if (value === undefined) {
        input.delete("default");
      } else {
        input.set("default", value);
      }
    },
  });

  input.defaultValue$ = input.observable$.pipe(
    map((v) => v.default),
    distinctUntilChanged()
  );

  input.setName = (name: string) => {
    input.set("name", name);
  };

  input.setVarName = (varName: string | undefined) => {
    if (varName === undefined) {
      input.delete("varName");
    } else {
      input.set("varName", varName);
    }
  };

  input.setTsType = (tsType: string | undefined) => {
    if (tsType === undefined) {
      input.delete("tsType");
    } else {
      input.set("tsType", tsType);
    }
  };

  input.setRequired = (required: boolean) => {
    input.set("required", required);
  };

  input.setDefault = (defaultValue: any) => {
    if (defaultValue === undefined) {
      input.delete("default");
    } else {
      input.set("default", defaultValue);
    }
  };

  input.remove = () => {
    input.component.props.remove(input);
  };

  return input as DataInputModel;
}

/**
 * Create a new local DataInput
 */
export function createDataInputModel(component: Component): DataInputModel {
  const ymap = new y.Map<any>();
  return withDataInputBehavior(ymap, component);
}
