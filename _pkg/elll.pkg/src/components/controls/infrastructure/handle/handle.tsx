import { Control, ResolvedControlProps } from "@repo/components";
import { Observable } from "rxjs";
import { Handle } from "../../../../../../elementa-interactor.pkg/dist";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";
import {
  EditorControlMap,
  editorControlMap,
  EditorControlType,
} from "../../control_map";

export function HandleControl<
  C extends EditorControlType,
  I extends Handle,
  T,
>({
  handles,
  value$,
  value,
  onChange,
  control,
  controlSettings,
}: {
  handles: I[];
  value$: (handle: I) => Observable<T>;
  value: (handle: I) => T;
  onChange: (handle: I, value: T) => void;
  control: C;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
}) {
  const vKey = handles.map((handle) => handle.key).join(".");
  const [_value$, _value] = useCommonReactivePair(
    handles.map(value$),
    handles.map(value),
    vKey,
  );

  return (
    <Control
      value={_value}
      value$={_value$}
      onChange={(value: any) => {
        handles.forEach((handle) => onChange(handle, value));
      }}
      type={control as any}
      settings={controlSettings}
      map={editorControlMap}
    />
  );
}
