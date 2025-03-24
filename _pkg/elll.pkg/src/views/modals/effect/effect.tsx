import {
  BlurFilterData,
  BoxShadowFilterData,
  BrightnessFilterData,
  ContrastFilterData,
  DropShadowFilterData,
  FilterData,
  GrayscaleFilterData,
  HueRotateFilterData,
  InvertFilterData,
  OpacityFilterData,
  SaturateFilterData,
  SepiaFilterData,
  TextShadowFilterData,
} from "@elllphnt/elll-element";
import { StyleFragmentType } from "@elllphnt/elll-element/types/_primitives/style/fragments/fragment";
import {
  FullControlEntry,
  lengthUnits,
  percentUnits,
  SelectControl,
  SwitchControl,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { DynamicControlEntry } from "~/src/components/ui/controls/dynamic";
import { DynamicType } from "../dynamics/_dynamics";

export function BlurControl({
  value,
  onChange,
}: {
  value: BlurFilterData;
  onChange: (value: BlurFilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Dimension}
        label="Radius"
        value={value.radius}
        onChange={(value) => {
          onChange({
            ...value,
            radius: value,
          } as BlurFilterData);
        }}
        controlSettings={{
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits],
        }}
        dynamics={{
          [DynamicType.StyleVariable]: {},
        }}
      />
    </>
  );
}

export function BrightnessControl({
  value,
  onChange,
}: {
  value: BrightnessFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function ContrastControl({
  value,
  onChange,
}: {
  value: ContrastFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function BoxShadowControl({
  value,
  onChange,
}: {
  value: BoxShadowFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <FullControlEntry>
        <SwitchControl
          value={(value as any).inset}
          onChange={(newValue) => onChange({ ...value, inset: newValue })}
          settings={{
            options: [
              { value: false, label: "Outset" },
              { value: true, label: "Inset" },
            ],
          }}
        />
      </FullControlEntry>
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset X"
        value={(value as any).offsetX}
        onChange={(newValue) => onChange({ ...value, offsetX: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset Y"
        value={(value as any).offsetY}
        onChange={(newValue) => onChange({ ...value, offsetY: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Blur Radius"
        value={(value as any).blurRadius}
        onChange={(newValue) => onChange({ ...value, blurRadius: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Spread Radius"
        value={(value as any).spreadRadius}
        onChange={(newValue) => onChange({ ...value, spreadRadius: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Color}
        label="Color"
        value={(value as any).color}
        onChange={(newValue) => onChange({ ...value, color: newValue })}
      />
    </>
  );
}

export function DropShadowControl({
  value,
  onChange,
}: {
  value: DropShadowFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset X"
        value={(value as any).offsetX}
        onChange={(newValue) => onChange({ ...value, offsetX: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset Y"
        value={(value as any).offsetY}
        onChange={(newValue) => onChange({ ...value, offsetY: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Standard Deviation"
        value={value.standardDeviation}
        onChange={(newValue) =>
          onChange({ ...value, standardDeviation: newValue as any })
        }
      />
      <DynamicControlEntry
        control={elllControlTypes.Color}
        label="Color"
        value={(value as any).color}
        onChange={(newValue) => onChange({ ...value, color: newValue })}
      />
    </>
  );
}

export function TextShadowControl({
  value,
  onChange,
}: {
  value: TextShadowFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset X"
        value={(value as any).offsetX}
        onChange={(newValue) => onChange({ ...value, offsetX: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Offset Y"
        value={(value as any).offsetY}
        onChange={(newValue) => onChange({ ...value, offsetY: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Length}
        label="Blur Radius"
        value={(value as any).blurRadius}
        onChange={(newValue) => onChange({ ...value, blurRadius: newValue })}
      />
      <DynamicControlEntry
        control={elllControlTypes.Color}
        label="Color"
        value={(value as any).color}
        onChange={(newValue) => onChange({ ...value, color: newValue })}
      />
    </>
  );
}

export function GrayscaleControl({
  value,
  onChange,
}: {
  value: GrayscaleFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function HueRotateControl({
  value,
  onChange,
}: {
  value: HueRotateFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Angle}
        label="Angle"
        value={(value as any).angle}
        onChange={(newValue) => onChange({ ...value, angle: newValue })}
      />
    </>
  );
}

export function InvertControl({
  value,
  onChange,
}: {
  value: InvertFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function OpacityControl({
  value,
  onChange,
}: {
  value: OpacityFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function SaturateControl({
  value,
  onChange,
}: {
  value: SaturateFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function SepiaControl({
  value,
  onChange,
}: {
  value: SepiaFilterData;
  onChange: (value: FilterData) => void;
}) {
  return (
    <>
      <DynamicControlEntry
        control={elllControlTypes.Number}
        label="Amount"
        value={(value as any).amount}
        onChange={(newValue) => onChange({ ...value, amount: newValue })}
      />
    </>
  );
}

export function Effect({
  styles,
  fragmentId,
}: {
  styles: Style[];
  fragmentId: string;
}) {
  const data = useObservable(
    styles[0]?.fragmentRegistry.fragment$(StyleFragmentType.Filter, fragmentId),
    styles[0]?.fragmentRegistry.fragment(StyleFragmentType.Filter, fragmentId),
  );

  let type = data?.data.type;

  function update(update: Partial<FilterData>) {
    styles.forEach((style) => {
      style.fragmentRegistry.setFragmentData(fragmentId, {
        ...data?.data,
        ...update,
      } as FilterData);
    });
  }

  let control = <></>;

  if (data) {
    switch (type) {
      case "blur":
        control = (
          <BlurControl
            value={data?.data as BlurFilterData}
            onChange={(value) => {
              update(value);
            }}
          />
        );
        break;
      case "brightness":
        control = (
          <BrightnessControl
            value={data?.data as BrightnessFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "contrast":
        control = (
          <ContrastControl
            value={data?.data as ContrastFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "box-shadow":
        control = (
          <BoxShadowControl
            value={data?.data as BoxShadowFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "drop-shadow":
        control = (
          <DropShadowControl
            value={data?.data as DropShadowFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "text-shadow":
        control = (
          <TextShadowControl
            value={data?.data as TextShadowFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "grayscale":
        control = (
          <GrayscaleControl
            value={data?.data as GrayscaleFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "hue-rotate":
        control = (
          <HueRotateControl
            value={data?.data as HueRotateFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "invert":
        control = (
          <InvertControl
            value={data?.data as InvertFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "opacity":
        control = (
          <OpacityControl
            value={data?.data as OpacityFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "saturate":
        control = (
          <SaturateControl
            value={data?.data as SaturateFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
      case "sepia":
        control = (
          <SepiaControl
            value={data?.data as SepiaFilterData}
            onChange={(value) => update(value)}
          />
        );
        break;
    }
  }

  return (
    <div
      className="el-p-3 el-space-y-2"
      style={{
        width: 240,
      }}
    >
      <FullControlEntry>
        <SwitchControl
          value={data?.data.backdrop || false}
          onChange={(value) => {
            update({ backdrop: value });
          }}
          settings={{
            options: [
              { value: false, label: "Element" },
              { value: true, label: "Backdrop" },
            ],
          }}
        />
      </FullControlEntry>
      <FullControlEntry label="Type">
        <SelectControl
          value={type}
          onChange={(value) => {
            update({ type: value as any });
          }}
          settings={{
            options: [
              { value: "blur", label: "Blur" },
              { value: "brightness", label: "Brightness" },
              { value: "contrast", label: "Contrast" },
              { value: "box-shadow", label: "Box shadow" },
              { value: "drop-shadow", label: "Drop shadow" },
              { value: "text-shadow", label: "Text shadow" },
              { value: "grayscale", label: "Grayscale" },
              { value: "hue-rotate", label: "Hue rotate" },
              { value: "invert", label: "Invert" },
              { value: "opacity", label: "Opacity" },
              { value: "saturate", label: "Saturate" },
              { value: "sepia", label: "Sepia" },
            ],
          }}
        />
      </FullControlEntry>

      {control}
    </div>
  );
}
