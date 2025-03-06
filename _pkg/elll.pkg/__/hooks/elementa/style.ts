import { resolveCommonValue } from "@repo/components";
import { Style, StyleData, StylePropertyName } from "@repo/elementa";
import { useManyObservables } from "@repo/utils";
import { useWorkspaceState } from "../shell/workspace";

export function useStylesCommonPropertyValue<P extends StylePropertyName>(
  styles: Style<StyleData>[],
  property: P,
) {
  const key = styles.map((style) => style.key).join(".");
  const value = useManyObservables(
    styles.map((style) => style.propertyValue$(property)),
    styles.map((style) => style.propertyValue(property)),
    key,
    //
  );

  return resolveCommonValue(value);
}

export function useElementPropertyState<T>(key: string[], defaultValue?: T) {
  return useWorkspaceState(
    ["elementa", "context", "properties", ...key],
    defaultValue,
  );
}
