import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  ControlMenuOptions,
  ResolvedControlProps,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { ReactNode } from "react";
import { Observable } from "rxjs";
import { useCommonReactivePair } from "../../../../../hooks/utils/reactivity";
import {
  EditorControlMap,
  ElllControlType,
  elllControlMap,
} from "../../_types";

export function ValueSetControl<C extends ElllControlType, I, T>({
  items,
  value$,
  value,
  onChange,
  control,
  controlSettings,
  vKey,
}: {
  items: I[];
  value$: (obj: I) => Observable<T>;
  value: (obj: I) => T;
  onChange: (obj: I, value: T) => void;
  control: C;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
  variant?: ControlEntryVariant;
  vKey: any;
}) {
  const [_value$, _value] = useCommonReactivePair(
    items.map(value$),
    items.map(value),
    vKey,
  );

  return (
    <Control
      value={_value}
      value$={_value$}
      onChange={(value: any) => {
        items.forEach((instance) => onChange(instance, value));
      }}
      type={control as any}
      settings={controlSettings}
      map={elllControlMap}
    />
  );
}

export function ValueSetControlEntry<C extends ElllControlType, I, T>({
  items,
  value$: getValue$,
  value: getValue,
  onChange,
  control,
  controlSettings,
  vKey,
  icon,
  menus,
  action,
  variant,
  label,
  onRemove,
}: {
  items: I[];
  value$: (obj: I) => Observable<T>;
  value: (obj: I) => T;
  onChange: (obj: I, value: T) => void;
  control: C;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
  variant?: ControlEntryVariant;
  vKey: any;
  icon?: ReactNode;
  menus?: ControlMenuOptions;
  action?: {
    icon: string;
    label: string;
    handler: () => void;
    active?: boolean;
  };
  label: ReactNode;
  onRemove?: () => void;
}) {
  const [_value$, _value] = useCommonReactivePair(
    items.map(getValue$),
    items.map(getValue),
    vKey,
  );

  const value = useObservable(_value$, _value);

  const controlElement = (
    <Control
      value={_value}
      value$={_value$}
      onChange={(value: any) =>
        items.forEach((instance) => onChange(instance, value))
      }
      type={control as any}
      settings={controlSettings}
      map={elllControlMap}
    />
  );

  return (
    <ControlEntry
      icon={icon}
      variant={variant}
      label={label}
      active={value !== undefined}
      menu={menus}
      onRemove={onRemove}
      action={action}
    >
      {controlElement}
    </ControlEntry>
  );
}
