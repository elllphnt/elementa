import { BackgroundLayerData } from "@elllphnt/elll-element";
import { StyleFragmentType } from "@elllphnt/elll-element/types/_primitives/style/fragments/fragment";
import { Style } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import Tabs from "~/src/components/ui/tabs/tabs";
import { GradientBackgroundLayerControl } from "./gradient";
import { ImageControl } from "./image";

export function BackgroundLayer({
  styles,
  fragmentId,
}: {
  styles: Style[];
  fragmentId: string;
}) {
  const data = useObservable(
    styles[0]?.fragmentRegistry.fragment$(
      StyleFragmentType.BackgroundLayer,
      fragmentId,
    ),
    styles[0]?.fragmentRegistry.fragment(
      StyleFragmentType.BackgroundLayer,
      fragmentId,
    ),
  );

  let type = data?.data.type;
  if (type !== "gradient" && type !== "image") {
    type = "gradient";
  }

  function update(update: Partial<BackgroundLayerData>) {
    styles.forEach((style) => {
      style.fragmentRegistry.setFragmentData(fragmentId, {
        ...data?.data,
        ...update,
      } as BackgroundLayerData);
    });
  }

  return (
    <div
      style={{
        width: 240,
      }}
    >
      <Tabs
        tabs={[
          {
            name: "Gradient",
            key: "gradient",
          },
          {
            name: "Image",
            key: "image",
          },
        ]}
        active={type}
        setActive={(value) => {
          if (value === "gradient") {
            update({ type: "gradient" });
          } else {
            update({ type: "image" });
          }
        }}
      />

      {type === "gradient" ? (
        <GradientBackgroundLayerControl
          value={(data?.data as any) || { type: "gradient" }}
          onChange={update}
        />
      ) : (
        <ImageControl
          value={(data?.data as any) || { type: "image" }}
          onChange={update}
        />
      )}
    </div>
  );
}
