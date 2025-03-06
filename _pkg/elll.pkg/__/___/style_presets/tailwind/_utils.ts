import { init } from "@paralleldrive/cuid2";
import {
  PropertyStyleUtilityGeneratorData,
  StyleUtilityGeneratorData,
} from "@repo/elementa";

export function mapPropertyUtilitiesGenerator<T>(
  generator: (key: string, value: T) => PropertyStyleUtilityGeneratorData,
  values: Record<string, T>,
): PropertyStyleUtilityGeneratorData[] {
  return Object.entries(values).map(([key, value]) => {
    return generator(key, value);
  });
}
export function mapStyleUtilitiesGenerator<T>(
  generator: (key: string, value: T) => StyleUtilityGeneratorData,
  values: Record<string, T>,
): StyleUtilityGeneratorData[] {
  return Object.entries(values).map(([key, value]) => {
    return generator(key, value);
  });
}

export function makeVariableSet<T>({
  name,
  values,
  datatype,
}: {
  name: string;
  values: Record<string, T>;
  datatype: string;
}): any {
  return {
    id: genId(),
    name,
    variables: Object.entries(values).map(([name, value]) => ({
      id: genId(),
      name,
      value,
    })),
    datatype,
  };
}

export const genId = init({
  length: 8,
});
