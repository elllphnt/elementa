import { CssSelector, StyleDataType } from "../_primitives/_.js";

export enum StyleModifierType {
  Context = "context", // a context modifier is a modifier that is applied to the context of the element
  Element = "element", // an element modifier is a modifier that is applied to the element itself
}

export type StyleModifierDefinitionData = {
  id: string;
  name: string;
  type: StyleModifierType;
  signature?: StyleDataType[]; // a sorted list of the argument types
  predecence?: number;
  selector?: CssSelector;
};

export type StyleModifierData = {
  name: string;
  args?: any[];
};

export type ElllSelectorData = StyleModifierData[];
