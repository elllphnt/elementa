import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { AnimationData, KeyFrameSet, Style } from "@repo/elementa";
import { useManyObservables, useObservable } from "@repo/utils";
import React from "react";
import { animationControlViews } from "../../../../components/controls/datatypes/animation/_view";
import { useProjectKeyframeSet } from "../../../../hooks/project/keyframe_set";
import { useElllProject } from "../../../../hooks/project/project";
import { resolveArrayIntersection } from "../../../../libs/utils";
import { modalViews } from "../../../modals/_";

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
    styles.map((style) => style.propertyValue$("animations")),
    styles.map((style) => style.propertyValue("animations")),
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
        let animations = style.propertyValue("animations");
        animations = animations
          ? [...animations, newAnimation]
          : [newAnimation];
        style.setProperty("animations", animations);
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
        viewId: animationControlViews.browser.id,
        title: "All Animations",
        props: {
          onSelect: (animation: AnimationData) => {
            styles.forEach((style) => {
              let animations = style.propertyValue("animations");
              const newAnimations = animations?.filter(
                (a) => a.key !== animation.key,
              );
              style.setProperty("animations", newAnimations);
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
              let animations = style.propertyValue("animations");
              animations = animations?.filter((t) => t !== animation);
              style.setProperty("animations", animations);
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
                let animations = style.propertyValue("animations");
                style.setProperty(
                  "animations",
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
