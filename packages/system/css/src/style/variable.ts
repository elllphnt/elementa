import {
  ArrayItem,
  isVarRef,
  stringifyFlexibleStyleData,
  stringifyStyleData,
  StyleDataType,
  StyleDataTypeMap,
  Variable,
  VarRef,
} from "@elllphnt/elementa-base";

export function varRefToCss(value: VarRef): string {
  return `var(--${value.__var})`;
}
export function variableStyleDataToCss<T extends StyleDataType>(
  type: T,
  data: Variable<StyleDataTypeMap[T]>
): string {
  if (isVarRef(data)) {
    return varRefToCss(data);
  }
  return stringifyStyleData(type, data);
}
export function variableFlexibleStyleDataToCss<T extends StyleDataType[]>(
  data: Variable<StyleDataTypeMap[ArrayItem<T>]>,
  ...types: T
): string {
  if (isVarRef(data)) {
    return varRefToCss(data);
  }
  return stringifyFlexibleStyleData(data, ...types);
}
