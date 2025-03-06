import {
  Control,
  ControlEntryVariant,
  ResolvedControlProps,
} from "@repo/components";
import { Observable } from "rxjs";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";
import {
  EditorControlMap,
  editorControlMap,
  EditorControlType,
} from "../../control_map";

export function ValueSetControl<C extends EditorControlType, I, T>({
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
      map={editorControlMap}
    />
  );
}
