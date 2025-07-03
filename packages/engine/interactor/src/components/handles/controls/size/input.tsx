import type {
  DimensionData,
  FlexData,
  LengthData,
  PercentData,
} from "@elllphnt/elementa-base";
import type { Observable } from "rxjs";
import type { ResizableHandle } from "~/handles/_types/resizable.js";
import { StylePropertySizeInput } from "./style_property.js";

export function SizeInput({
  value: getValue,
  value$: getValue$,
  setValue,
  handles,
}: {
  value: (
    handle: ResizableHandle
  ) => number | DimensionData<string> | string | undefined;
  value$: (
    handle: ResizableHandle
  ) => Observable<number | DimensionData<string> | string | undefined>;
  setValue: (
    handle: ResizableHandle,
    value: LengthData | PercentData | FlexData | "fit" | undefined
  ) => void;
  handles: ResizableHandle[];
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
