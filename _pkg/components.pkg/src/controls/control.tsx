import {
  ControlMap,
  ResolvedControlProps,
  baseControlMap,
} from "./control_map";

export function Control<M extends ControlMap<string>, T extends keyof M>({
  type,
  value$,
  value,
  onChange,
  settings,
  map,
}: ResolvedControlProps<M, T> & {
  type: T;
  map?: M;
}) {
  const Control = (map ?? (baseControlMap as unknown as M))[type] as any;
  if (!Control) throw new Error(`Control ${String(type)} not found`);

  return (
    <Control
      value={value}
      value$={value$}
      onChange={onChange}
      settings={settings}
    />
  );
}
