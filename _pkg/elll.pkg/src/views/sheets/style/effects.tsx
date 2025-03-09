import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables } from "@repo/utils";
import { useCallback, useEffect, useMemo } from "react";
import { BehaviorSubject } from "rxjs";

const effectInits = {
  blur: {
    radius: 5,
  },
  brightness: {
    value: 1,
  },
  contrast: {
    value: 1,
  },
  dropShadow: {
    offsetX: 0,
    offsetY: 2,
    blurRadius: 6,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
  },
  boxShadow: {
    inset: false,
    offsetX: 0,
    offsetY: 2,
    blurRadius: 6,
    spreadRadius: 2,
    color: { r: 0, g: 0, b: 0, a: 1 },
  },
  grayscale: {
    value: 1,
  },
  hueRotate: {
    angle: 90,
  },
  invert: {
    value: 1,
  },
  opacity: {
    value: 1,
  },
  saturate: {
    value: 1,
  },
  sepia: {
    value: 1,
  },
  hidden: undefined as never,
};

function AddEffectAction({ handler }: { handler: (type: FilterType) => void }) {
  useAction({
    title: "Add Effect",
    icon: elllIcons16.plus,
    options: [
      {
        label: "Blur",
        onClick: () => {
          handler("blur");
        },
      },
      {
        label: "Box Shadow",
        onClick: () => {
          handler("boxShadow");
        },
      },
      {
        label: "Brightness",
        onClick: () => {
          handler("brightness");
        },
      },
      {
        label: "Contrast",
        onClick: () => {
          handler("contrast");
        },
      },
      {
        label: "Drop Shadow",
        onClick: () => {
          handler("dropShadow");
        },
      },
      {
        label: "Grayscale",
        onClick: () => {
          handler("grayscale");
        },
      },
      {
        label: "Hue Rotate",
        onClick: () => {
          handler("hueRotate");
        },
      },
      {
        label: "Invert",
        onClick: () => {
          handler("invert");
        },
      },
      {
        label: "Opacity",
        onClick: () => {
          handler("opacity");
        },
      },
      {
        label: "Saturate",
        onClick: () => {
          handler("saturate");
        },
      },
      {
        label: "Sepia",
        onClick: () => {
          handler("sepia");
        },
      },
    ],
  });
  return <></>;
}

function EffectEntry({
  effect,
  onChange,
  onRemove,
}: {
  effect: FilterData;
  onChange: (effect: FilterData) => void;
  onRemove: () => void;
}) {
  const effectSubject = useMemo(() => {
    return new BehaviorSubject<FilterData>(effect);
  }, []);
  const { openMenu } = useControlMenu();

  useEffect(() => {
    effectSubject.next(effect);
  }, [effect]);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={(e) => {
        openMenu({
          anchor: e.currentTarget,
          viewId: effectControlViews.menu.id,
          title: "Effect",
          props: {
            value: effect,
            value$: effectSubject.asObservable(),
            onChange,
          },
        });
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: onRemove,
        },
      ]}
    >
      {effect.type}, {effect.target}
    </TreeEntry>
  );
}

export function StyleEffectsControlSheet({
  styles,
}: {
  styles: Style[];
}): JSX.Element {
  const stylesKey = styles.map((style) => style.key).join(",");
  const effects = useManyObservables(
    styles.map((style) => style.propertyValue$("filters")),
    styles.map((style) => style.propertyValue("filters")),
    stylesKey,
  );
  let commonEffects: FilterData[] = [];
  if (Array.isArray(effects[0])) {
    commonEffects = effects[0];
  }
  for (let i = 1; i < effects.length; i++) {
    if (Array.isArray(effects[i])) {
      const efcts = effects[i] as FilterData[];
      commonEffects = commonEffects.filter((effect) => {
        return efcts.some((otherEffect) => otherEffect.key === effect.key);
      });
    } else {
      commonEffects = [];
    }
  }

  const handleAddEffect = useCallback((type: FilterType) => {
    let newFilter: FilterData = {
      key: Math.random().toString(36).substring(2, 7),
      target: "element",
      type,
      data: effectInits[type],
    };

    styles.forEach((style) => {
      let filters = style.propertyValue("filters");
      if (Array.isArray(filters)) {
        style.setProperty("filters", [...filters, newFilter]);
      } else {
        style.setProperty("filters", [newFilter]);
      }
    });
    console.log("add effect", styles);
  }, []);

  return (
    <>
      <AddEffectAction handler={handleAddEffect} />
      {commonEffects.map((effect) => (
        <EffectEntry
          key={effect.key}
          effect={effect}
          onChange={(effect) => {
            styles.forEach((style) => {
              let newEffects = style.propertyValue("filters");
              if (!Array.isArray(newEffects)) {
                newEffects = [];
              }

              newEffects = newEffects.map((e) => {
                if (e.key === effect.key) {
                  return effect;
                } else {
                  return e;
                }
              });

              style.setProperty("filters", newEffects);
            });
          }}
          onRemove={() => {
            styles.forEach((style) => {
              let newEffects = style.propertyValue("filters");
              if (!Array.isArray(newEffects)) {
                newEffects = [];
              }
              newEffects = newEffects.filter((e) => e.key !== effect.key);
              style.setProperty("filters", newEffects);
            });
          }}
        />
      ))}
    </>
  );
}
