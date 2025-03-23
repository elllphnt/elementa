import { backgroundLayerToCss } from "@elllphnt/elll-element";
import {
  StyleFragmentData,
  StyleFragmentType,
} from "@elllphnt/elll-element/types/_primitives/style/fragments/fragment";
import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables } from "@repo/utils";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { keys } from "~/src/libs/keys";
import { resolveArrayIntersection } from "~/src/libs/utils";
import { StylePropertyGroupControlEntry } from "./style_properties/group_control_entry";

function BackgroundLayerControlEntry({
  styles,
  layer,
}: {
  styles: Style[];
  layer: StyleFragmentData<StyleFragmentType.BackgroundLayer>;
}) {
  const { openMenu } = useControlMenu();

  let icon = <Icon name={elllIcons16.containerFilled} />;
  switch (layer.data.type) {
    case "gradient":
      icon = (
        <div
          className="el-border el-rounded el-h-4 el-w-4"
          style={{
            background: backgroundLayerToCss(layer.data),
          }}
        />
      );
      break;
    case "image":
      icon = <Icon name={elllIcons16.image} />;
      break;
  }

  return (
    <TreeEntry
      icon={icon}
      className="el-border"
      onClick={() => {
        openMenu({
          title: "Background layer",
          viewId: keys.views.modals.backgroundLayer,
          props: {
            styles,
            fragmentId: layer._id,
          },
        });
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            styles.forEach((style) => {
              style.fragmentRegistry.removeFragment(layer._id);
              const backgroundLayersValue =
                style.propertyValue("background-layers");
              let backgroundLayers =
                typeof backgroundLayersValue === "string"
                  ? backgroundLayersValue.split(",").map((s) => s.trim())
                  : [];
              backgroundLayers = backgroundLayers.filter(
                (id) => id !== layer._id,
              );
              style.setProperty(
                "background-layers",
                backgroundLayers.join(","),
              );
            });
          },
        },
      ]}
    >
      {backgroundLayerToCss(layer.data)}
    </TreeEntry>
  );
}

export function BackgroundControlSheet({ styles }: { styles: Style[] }) {
  const allLayers = useManyObservables(
    styles.map((style) =>
      style.fragmentRegistry.fragments$(StyleFragmentType.BackgroundLayer),
    ),
    styles.map((style) =>
      style.fragmentRegistry.fragments(StyleFragmentType.BackgroundLayer),
    ),
    styles.map((style) => style.key).join("."),
  );
  const layerValues = useManyObservables(
    styles.map((s) => s.propertyValue$("background-layers")),
    styles.map((s) => s.propertyValue("background-layers")),
    styles.map((style) => style.key).join("."),
  );
  const commonUsedLayerIds = resolveArrayIntersection(
    layerValues.map((v) =>
      typeof v === "string" ? v.split(",").map((v) => v.trim()) : [],
    ),
  );
  const commonUnusedLayerMap: Record<
    string,
    StyleFragmentData<StyleFragmentType.BackgroundLayer>
  > = Object.fromEntries(
    resolveArrayIntersection(allLayers, (a, b) => a._id === b._id).map((g) => [
      g._id,
      g,
    ]),
  );

  const commonUsedLayers: StyleFragmentData<StyleFragmentType.BackgroundLayer>[] =
    [];
  commonUsedLayerIds.forEach((id) => {
    const layer = commonUnusedLayerMap[id];
    if (layer) {
      delete commonUnusedLayerMap[id];
      commonUsedLayers.push(layer);
    }
  });
  const commonUnusedLayers: StyleFragmentData<StyleFragmentType.BackgroundLayer>[] =
    Object.values(commonUnusedLayerMap);

  useAction({
    title: "Add layer",
    icon: elllIcons16.plus,
    index: Number.MAX_SAFE_INTEGER,
    handler: () => {
      styles.forEach((style) => {
        const fragment = style.fragmentRegistry.addFragment(
          StyleFragmentType.BackgroundLayer,
          {
            type: "gradient",
            gradient: {
              type: "linear",
              angle: {
                value: 0,
                unit: "deg",
              },
              stops: [
                {
                  position: {
                    value: 0,
                    unit: "%",
                  },
                  color: {
                    model: "rgb",
                    value: [0, 0, 0],
                    alpha: 1,
                  },
                },
                {
                  position: {
                    value: 100,
                    unit: "%",
                  },
                  color: {
                    model: "rgb",
                    value: [255, 255, 255],
                    alpha: 1,
                  },
                },
              ],
            },
          },
        );
        const backgroundLayersValue = style.propertyValue("background-layers");
        const backgroundLayers =
          typeof backgroundLayersValue === "string"
            ? backgroundLayersValue.split(",").map((s) => s.trim())
            : [];
        backgroundLayers.unshift(fragment._id);
        style.setProperty("background-layers", backgroundLayers.join(","));
      });
    },
  });

  return (
    <>
      <StylePropertyGroupControlEntry
        index={0}
        styles={styles}
        group={{
          name: "Color",
          icon: elllIcons16.color,
          properties: [
            {
              name: "background-color",
              displayName: "Color",
              icon: elllIcons16.color,
              initialValue: 1,
              control: elllControlTypes.Color,
            },
          ],
        }}
      />

      {commonUsedLayers.map((layer) => (
        <BackgroundLayerControlEntry
          key={layer._id}
          styles={styles}
          layer={layer}
        />
      ))}

      {commonUnusedLayers.length ? (
        <>
          <hr />
          {commonUnusedLayers.map((layer) => (
            <BackgroundLayerControlEntry
              key={layer._id}
              styles={styles}
              layer={layer}
            />
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
