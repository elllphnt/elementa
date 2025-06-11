import { ElllSelectorData, StyleDataType } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { Identifiable } from "../_shared/_.js";

export interface StyleVariable extends Identifiable {
  name: string | undefined;
  name$: Observable<string | undefined>;

  values: Record<string, any> | undefined;
  values$: Observable<Record<string, any> | undefined>;

  setName(name: string | undefined): void;
  setValue(key: string, value: any): void;
  removeValue(key: string): void;
  setValues(values: Record<string, any>): void;
}

export interface StyleVariableSet extends Identifiable {
  name: string;
  name$: Observable<string>;

  datatype: StyleDataType | undefined;
  datatype$: Observable<StyleDataType | undefined>;

  modes: ElllSelectorData[] | undefined;
  modes$: Observable<ElllSelectorData[] | undefined>;

  variables: StyleVariable[];
  variables$: Observable<StyleVariable[]>;

  variable(id: string): StyleVariable | undefined;
  variable$(id: string): Observable<StyleVariable | undefined>;

  setName(name: string): void;
  setDatatype(datatype: StyleDataType | undefined): void;
  setModes(modes: ElllSelectorData[] | undefined): void;

  addVariable(data: StyleVariable): void;
  removeVariable(id: string): void;
}

export interface StyleVariableSheet {
  project: Project;

  variableSets: StyleVariableSet[];
  variableSets$: Observable<StyleVariableSet[]>;

  variableSet(id: string): StyleVariableSet | undefined;
  variableSet$(id: string): Observable<StyleVariableSet | undefined>;

  variableSetByName(name: string): StyleVariableSet | undefined;
  variableSetByName$(name: string): Observable<StyleVariableSet | undefined>;

  addVariableSet(data: StyleVariableSet): void;
  removeVariableSet(id: string): void;
}
