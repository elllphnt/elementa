import {
  DimensionData,
  FlexData,
  LengthData,
  PercentData,
} from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { IResizableHandle } from "~/src/_types/handles/properties/resizable";
import { StylePropertySizeInput } from "./style_property";

export function SizeInput({
  value: getValue,
  value$: getValue$,
  setValue,
  handles,
}: {
  value: (
    handle: IResizableHandle
  ) => number | DimensionData<string> | string | undefined;
  value$: (
    handle: IResizableHandle
  ) => Observable<number | DimensionData<string> | string | undefined>;
  setValue: (
    handle: IResizableHandle,
    value: LengthData | PercentData | FlexData | "fit" | undefined
  ) => void;
  handles: IResizableHandle[];
}) {
  const handlesKey = handles.map((handle) => handle.key).join(":");
  return (
    <StylePropertySizeInput
      values={handles.map(getValue)}
      values$={handles.map(getValue$)}
      onChange={(value) => {
        handles.forEach((handle) => {
          setValue(handle, value);
        });
      }}
      vKey={handlesKey}
    />
  );
}
