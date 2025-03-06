import {
  Control,
  ControlEntryVariant,
  ResolvedControlProps,
} from "@repo/components";
import { Instance } from "@repo/elementa";
import { Observable } from "rxjs";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";
import {
  EditorControlMap,
  editorControlMap,
  EditorControlType,
} from "../../control_map";

export function InstanceControl<
  C extends EditorControlType,
  I extends Instance,
  T,
>({
  instances,
  value$,
  value,
  onChange,
  control,
  controlSettings,
}: {
  instances: I[];
  value$: (instance: I) => Observable<T>;
  value: (instance: I) => T;
  onChange: (instance: I, value: T) => void;
  control: C;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
  variant?: ControlEntryVariant;
}) {
  const vKey = instances.map((instance) => instance.key).join(".");
  const [_value$, _value] = useCommonReactivePair(
    instances.map(value$),
    instances.map(value),
    vKey,
  );

  return (
    <Control
      value={_value}
      value$={_value$}
      onChange={(value: any) => {
        instances.forEach((instance) => onChange(instance, value));
      }}
      type={control as any}
      settings={controlSettings}
      map={editorControlMap}
    />
  );
}
