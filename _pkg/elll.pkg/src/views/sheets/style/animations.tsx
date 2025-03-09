import { AnimationData } from "@elllphnt/elll-element";
import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables, useObservable } from "@repo/utils";
import React from "react";
import { useElllProject } from "~/src/hooks/project/project";
import { resolveArrayIntersection } from "~/src/libs/utils";

function AnimationEntry({
  animation,
  onRemove,
  onClick,
  onEdit,
}: {
  animation: AnimationData;
  onRemove: () => void;
  onClick: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
}) {
  const keyframe = useProjectKeyframeSet(animation.keyframe);
  const name = useObservable(keyframe?.name$, keyframe?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={onClick}
      actions={[
        {
          icon: <Icon name={elllIcons16.edit} />,
          handler: onEdit,
        },
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: onRemove,
        },
      ]}
    >
      {name ?? "Animation"}
    </TreeEntry>
  );
}

export function StyleAnimationsControlSheet({
  styles,
}: {
  styles: Style[];
}): JSX.Element {
  const project = useElllProject();
  const stylesKey = styles.map((style) => style.key).join(",");
  const animations = useManyObservables(
    styles.map((style) => style.propertyValue$("animation")),
    styles.map((style) => style.propertyValue("animation")),
    stylesKey,
  ).filter(Boolean) as AnimationData[][];
  const { openMenu, closeMenu } = useControlMenu();

  let commonAnimations = resolveArrayIntersection(animations);

  useAction({
    title: "Add Animation",
    icon: elllIcons16.plus,
    index: 1,
    handler: () => {
      const newAnimation: AnimationData = {
        key: Math.random().toString(36).substring(7),
      };
      styles.forEach((style) => {
        let animations = style.propertyValue("animation");
        animations = animations
          ? [...animations, newAnimation]
          : [newAnimation];
        style.setProperty("animation", animations);
      });
    },
  });
  useAction({
    title: "All Animations",
    icon: elllIcons16.folderOpen,
    index: 0,
    handler: (e) => {
      openMenu({
        anchor: e.currentTarget as any,
        viewId: "animationControlViews.browser.id",
        title: "All Animations",
        props: {
          onSelect: (animation: AnimationData) => {
            styles.forEach((style) => {
              let animations = style.propertyValue("animation");
              const newAnimations = animations?.filter(
                (a) => a.key !== animation.key,
              );
              style.setProperty("animation", newAnimations);
            });
            closeMenu();
          },
        },
      });
    },
  });

  return (
    <>
      {commonAnimations.map((animation) => (
        <AnimationEntry
          key={animation.key}
          animation={animation}
          onRemove={() => {
            styles.forEach((style) => {
              let animations = style.propertyValue("animation");
              animations = animations?.filter((t) => t !== animation);
              style.setProperty("animation", animations);
            });
          }}
          onEdit={(e) => {
            let keyframeSetId = animation.keyframe;
            if (!keyframeSetId) {
              const keyframeSet = new KeyFrameSet({ project });
              keyframeSet.addKeyframe({ offset: 0 });
              keyframeSet.addKeyframe({ offset: 1 });
              project.keyframeSetStore.addKeyframeSet(keyframeSet);
              keyframeSetId = keyframeSet.id;
              styles.forEach((style) => {
                let animations = style.propertyValue("animation");
                style.setProperty(
                  "animation",
                  animations?.map((a) => {
                    if (a.key === animation.key) {
                      return {
                        ...a,
                        keyframe: keyframeSetId,
                      };
                    }
                    return a;
                  }),
                );
              });
            }

            openMenu({
              anchor: e.currentTarget as any,
              viewId: modalViews.keyFrameSetEditor.id,
              title: "Keyframes",
              props: {
                keyframeSetId,
              },
            });
          }}
          onClick={(e) => {
            openMenu({
              anchor: e.currentTarget as any,
              viewId: animationControlViews.styleMenu.id,
              title: "Animation",
              props: {
                styles,
                animationKey: animation.key,
              },
            });
          }}
        />
      ))}
    </>
  );
}
