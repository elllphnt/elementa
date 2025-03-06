import {
  BooleanControl,
  ColorControl,
  FullControlEntry,
  SpinnerControl,
} from "@repo/components";
import { FilterData, FilterType } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { Observable } from "rxjs";

function BlurEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"blur">;
  onChange?: (value: FilterData<"blur">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Radius">
        <SpinnerControl
          value={value?.data.radius}
          onChange={(r) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                radius: r ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>
    </>
  );
}

function BoxShadowEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"boxShadow">;
  onChange?: (value: FilterData<"boxShadow">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Inset">
        <BooleanControl
          value={value?.data.inset}
          onChange={(inset) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                inset: inset ?? false,
              },
            });
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Color">
        <ColorControl
          value={value?.data.color}
          onChange={(color) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                color: color ?? {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
              },
            });
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Offset X">
        <SpinnerControl
          value={value?.data.offsetX}
          onChange={(offsetX) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                offsetX: offsetX ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Offset Y">
        <SpinnerControl
          value={value?.data.offsetY}
          onChange={(offsetY) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                offsetY: offsetY ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Blur Radius">
        <SpinnerControl
          value={value?.data.blurRadius}
          onChange={(blurRadius) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                blurRadius: blurRadius ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Spread Radius">
        <SpinnerControl
          value={value?.data.spreadRadius}
          onChange={(spreadRadius) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                spreadRadius: spreadRadius ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>
    </>
  );
}

function DropShadowEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"dropShadow">;
  onChange?: (value: FilterData<"dropShadow">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Color">
        <ColorControl
          value={value?.data.color}
          onChange={(color) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                color: color ?? {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                },
              },
            });
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Offset X">
        <SpinnerControl
          value={value?.data.offsetX}
          onChange={(offsetX) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                offsetX: offsetX ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Offset Y">
        <SpinnerControl
          value={value?.data.offsetY}
          onChange={(offsetY) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                offsetY: offsetY ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>

      <FullControlEntry label="Blur Radius">
        <SpinnerControl
          value={value?.data.blurRadius}
          onChange={(blurRadius) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                blurRadius: blurRadius ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
          }}
        />
      </FullControlEntry>
    </>
  );
}

function BrightnessEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"brightness">;
  onChange?: (value: FilterData<"brightness">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Value">
        <SpinnerControl
          value={value?.data.value}
          onChange={(v) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                value: Math.round((v ?? 0) * 100) / 100,
              },
            });
          }}
          settings={{
            min: 0,
            step: 0.01,
            max: 1,
            round: 2,
          }}
        />
      </FullControlEntry>
    </>
  );
}

function ContrastEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"contrast">;
  onChange?: (value: FilterData<"contrast">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Value">
        <SpinnerControl
          value={value?.data.value}
          onChange={(v) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                value: Math.round((v ?? 0) * 100) / 100,
              },
            });
          }}
          settings={{
            min: 0,
            step: 0.01,
            max: 1,
            round: 2,
          }}
        />
      </FullControlEntry>
    </>
  );
}

function ValueEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"grayscale">;
  onChange?: (value: FilterData<"grayscale">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Value">
        <SpinnerControl
          value={value?.data.value}
          onChange={(v) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                value: Math.round((v ?? 0) * 100) / 100,
              },
            });
          }}
          settings={{
            min: 0,
            step: 0.01,
            max: 1,
            round: 2,
          }}
        />
      </FullControlEntry>
    </>
  );
}
function HueRotationEffectMenu({
  value,
  onChange,
}: {
  value: FilterData<"hueRotate">;
  onChange?: (value: FilterData<"hueRotate">) => void;
}) {
  return (
    <>
      <FullControlEntry label="Angle">
        <SpinnerControl
          value={value?.data.angle as number}
          onChange={(a) => {
            onChange?.({
              ...value,
              data: {
                ...value.data,
                angle: a ?? 0,
              },
            });
          }}
          settings={{
            min: 0,
            step: 1,
            max: 360,
          }}
        />
      </FullControlEntry>
    </>
  );
}

export function EffectMenu<T extends FilterType>({
  value,
  value$,
  onChange,
}: {
  value?: FilterData<T>;
  value$?: Observable<FilterData<T>>;
  onChange?: (value: FilterData<T>) => void;
}) {
  const currentValue = useObservable(value$, value);

  switch (value?.type) {
    case "blur": {
      return (
        <BlurEffectMenu
          value={currentValue as FilterData<"blur">}
          onChange={onChange as (value: FilterData<"blur">) => void}
        />
      );
    }
    case "boxShadow": {
      return (
        <BoxShadowEffectMenu
          value={currentValue as FilterData<"boxShadow">}
          onChange={onChange as (value: FilterData<"boxShadow">) => void}
        />
      );
    }
    case "brightness": {
      return (
        <BrightnessEffectMenu
          value={currentValue as FilterData<"brightness">}
          onChange={onChange as (value: FilterData<"brightness">) => void}
        />
      );
    }
    case "contrast": {
      return (
        <ContrastEffectMenu
          value={currentValue as FilterData<"contrast">}
          onChange={onChange as (value: FilterData<"contrast">) => void}
        />
      );
    }
    case "dropShadow": {
      return (
        <DropShadowEffectMenu
          value={currentValue as FilterData<"dropShadow">}
          onChange={onChange as (value: FilterData<"dropShadow">) => void}
        />
      );
    }
    case "grayscale": {
      return (
        <ValueEffectMenu
          value={currentValue as FilterData<"grayscale">}
          onChange={onChange as (value: FilterData<"grayscale">) => void}
        />
      );
    }
    case "hueRotate": {
      return (
        <HueRotationEffectMenu
          value={currentValue as FilterData<"hueRotate">}
          onChange={onChange as (value: FilterData<"hueRotate">) => void}
        />
      );
    }
    case "invert": {
      return (
        <ValueEffectMenu
          value={currentValue as FilterData<"grayscale">}
          onChange={onChange as (value: FilterData<"grayscale">) => void}
        />
      );
    }
    case "opacity": {
      return (
        <ValueEffectMenu
          value={currentValue as FilterData<"grayscale">}
          onChange={onChange as (value: FilterData<"grayscale">) => void}
        />
      );
    }
    case "saturate": {
      return (
        <ValueEffectMenu
          value={currentValue as FilterData<"grayscale">}
          onChange={onChange as (value: FilterData<"grayscale">) => void}
        />
      );
    }
    case "sepia": {
      return (
        <ValueEffectMenu
          value={currentValue as FilterData<"grayscale">}
          onChange={onChange as (value: FilterData<"grayscale">) => void}
        />
      );
    }
  }
}
