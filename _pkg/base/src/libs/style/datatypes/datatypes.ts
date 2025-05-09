import { ArrayItem } from "../../../types/_primitives/array.js";
import {
  StyleDataType,
  StyleDataTypeMap,
} from "../../../types/_primitives/style/datatypes.js";
import { styleDataNormalizers } from "./nomalizers.js";
import { styleDataSchemas } from "./schemas.js";
import { styleDataStringifiers } from "./stringifiers.js";

export function getStyleDataType(
  data: unknown,
  possibleTypes?: StyleDataType[]
): StyleDataType | undefined {
  const types =
    possibleTypes || (Object.keys(styleDataSchemas) as StyleDataType[]);
  for (const type of types) {
    if (validateStyleData(type, data)) {
      return type;
    }
  }
  return undefined;
}

export function stringifyStyleData<T extends StyleDataType>(
  type: T,
  value: StyleDataTypeMap[T]
): string {
  const stringify = styleDataStringifiers[type];
  return stringify(value);
}

export function stringifyFlexibleStyleData<T extends StyleDataType[]>(
  value: StyleDataTypeMap[ArrayItem<T>],
  ...types: T
): string {
  const electedType = getStyleDataType(value, types);
  if (!electedType) {
    throw new Error(
      `No matching type found for value: ${JSON.stringify(value)}`
    );
  }
  return stringifyStyleData(electedType, value);
}

export function validateStyleData<T extends StyleDataType>(
  type: T,
  value: unknown
): value is StyleDataTypeMap[T] {
  const schema = styleDataSchemas[type];
  return schema.isValidSync(value);
}

export function normalizeStyleData<T>(type: StyleDataType, value: T): T {
  const normalize = styleDataNormalizers[type];
  if (normalize) {
    return normalize(value) as T;
  } else {
    return value;
  }
}
