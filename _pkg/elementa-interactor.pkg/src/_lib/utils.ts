import _ from "lodash";

export function resolveCommonValue<T>(
  values: T[],
  equal: (a: T, b: T) => boolean = _.isEqual,
): T | typeof mixed {
  const firstValue = values[0];
  if (values.every((value) => equal(value, firstValue))) {
    return firstValue;
  }
  return mixed;
}

export const mixed = Symbol("mixed");
export type MixedType = typeof mixed;
