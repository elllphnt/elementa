import { Control as BaseControl, ResolvedControlProps } from "@repo/components";
import { elllControlMap, ElllControlType } from "./_types";

export function Control<T extends ElllControlType>({
  type,
  value$,
  value,
  onChange,
  settings,
}: ResolvedControlProps<typeof elllControlMap, T> & {
  type: T;
}) {
  return (
    <BaseControl
      {...({
        type,
        value,
        value$,
        onChange,
        settings,
        map: elllControlMap,
      } as any)}
    />
  );
}
