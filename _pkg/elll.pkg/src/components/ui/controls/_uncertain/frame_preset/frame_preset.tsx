import {
  elllIcons16,
  Icon,
  MenuButtonControl,
  mixed,
  MixedType,
  resolveCommonValue,
} from "@repo/components";
import { FrameWidgetInstance } from "@repo/elementa";
import { combineLatestOrEmpty, useManyObservables } from "@repo/utils";
import { useMemo } from "react";
import { map } from "rxjs";
import { framePresetControlViews } from "./_views/_";
import { framePresets } from "./_views/frame_presets";

export function resolveFramePresetLabel(
  size: { width?: number; height?: number } | MixedType,
) {
  if (size === mixed) {
    return "mixed";
  }

  const preset = framePresets.find(
    (preset) => preset.width === size.width && preset.height === size.height,
  );

  if (preset) {
    return preset.name;
  } else {
    return `${size.width} x ${size.height}`;
  }
}

export function FramePresetControl({
  instances,
}: {
  instances: FrameWidgetInstance[];
}) {
  const vKey = instances.map((instance) => instance.key).join(".");
  const [sizes$, sizes] = useMemo(() => {
    const sizes$ = instances.map((instance) =>
      combineLatestOrEmpty([
        instance.entity.viewportWidth$,
        instance.entity.viewportHeight$,
      ]).pipe(map(([width, height]) => ({ width, height }))),
    );
    const sizes = instances.map((instance) => ({
      width: instance.entity.viewportWidth,
      height: instance.entity.viewportHeight,
    }));

    return [sizes$, sizes];
  }, [vKey]);

  const _sizes = useManyObservables(sizes$, sizes, vKey);
  const commonSize = resolveCommonValue(_sizes);

  const label = resolveFramePresetLabel(commonSize);

  return (
    <MenuButtonControl
      onChange={(value: any) => {
        instances.forEach((instance) => {
          instance.entity.setViewportWidth(value.width);
          instance.entity.setViewportHeight(value.height);
        });
      }}
      settings={{
        prefix: (
          <Icon className="el-h-4 el-w-4" name={elllIcons16.toolWidget} />
        ),
        menu: {
          title: "Frame",
          viewId: framePresetControlViews.menu.id,
        },
        label: label,
      }}
    />
  );
}
