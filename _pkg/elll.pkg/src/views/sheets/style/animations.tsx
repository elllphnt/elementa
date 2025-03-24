// import {
//   elllIcons16,
//   Icon,
//   TreeEntry,
//   useAction,
//   useControlMenu,
// } from "@repo/components";
// import { Style } from "@repo/elementa-models";
// import { useManyObservables } from "@repo/utils";
// import { useCallback, useAnimation, useMemo } from "react";
// import { BehaviorSubject } from "rxjs";

import { animationToCss } from "@elllphnt/elll-element";
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
import { keys } from "~/src/libs/keys";
import { resolveArrayIntersection } from "~/src/libs/utils";

function AnimationControlEntry({
  styles,
  animation,
}: {
  styles: Style[];
  animation: StyleFragmentData<StyleFragmentType.Animation>;
}) {
  const { openMenu } = useControlMenu();
  let text = "";
  try {
    text = animationToCss(animation.data);
    if (!text) {
      text = "Animation";
    }
  } catch (e) {
    text = "Animation";
  }

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.opacity} />}
      className="el-border"
      onClick={() => {
        openMenu({
          title: "Animation",
          viewId: keys.views.modals.animation,
          props: {
            styles,
            fragmentId: animation._id,
          },
        });
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            styles.forEach((style) => {
              style.fragmentRegistry.removeFragment(animation._id);
              const backgroundAnimationsValue =
                style.propertyValue("animations");
              let animations =
                typeof backgroundAnimationsValue === "string"
                  ? backgroundAnimationsValue.split(",").map((s) => s.trim())
                  : [];
              animations = animations.filter((id) => id !== animation._id);
              style.setProperty("animations", animations.join(","));
            });
          },
        },
      ]}
    >
      {text}
    </TreeEntry>
  );
}

export function StyleAnimationsControlSheet({ styles }: { styles: Style[] }) {
  const allAnimations = useManyObservables(
    styles.map((style) =>
      style.fragmentRegistry.fragments$(StyleFragmentType.Animation),
    ),
    styles.map((style) =>
      style.fragmentRegistry.fragments(StyleFragmentType.Animation),
    ),
    styles.map((style) => style.key).join("."),
  );
  const animationValues = useManyObservables(
    styles.map((s) => s.propertyValue$("animations")),
    styles.map((s) => s.propertyValue("animations")),
    styles.map((style) => style.key).join("."),
  );
  const commonUsedAnimationIds = resolveArrayIntersection(
    animationValues.map((v) =>
      typeof v === "string" ? v.split(",").map((v) => v.trim()) : [],
    ),
  );
  const commonUnusedAnimationMap: Record<
    string,
    StyleFragmentData<StyleFragmentType.Animation>
  > = Object.fromEntries(
    resolveArrayIntersection(allAnimations, (a, b) => a._id === b._id).map(
      (g) => [g._id, g],
    ),
  );

  const commonUsedAnimations: StyleFragmentData<StyleFragmentType.Animation>[] =
    [];
  commonUsedAnimationIds.forEach((id) => {
    const animation = commonUnusedAnimationMap[id];
    if (animation) {
      delete commonUnusedAnimationMap[id];
      commonUsedAnimations.push(animation);
    }
  });
  const commonUnusedAnimations: StyleFragmentData<StyleFragmentType.Animation>[] =
    Object.values(commonUnusedAnimationMap);

  useAction({
    title: "Add Animation",
    icon: elllIcons16.plus,
    index: Number.MAX_SAFE_INTEGER,
    handler: () => {
      styles.forEach((style) => {
        const fragment = style.fragmentRegistry.addFragment(
          StyleFragmentType.Animation,
          {},
        );
        const backgroundAnimationsValue = style.propertyValue("animations");
        const backgroundAnimations =
          typeof backgroundAnimationsValue === "string"
            ? backgroundAnimationsValue.split(",").map((s) => s.trim())
            : [];
        backgroundAnimations.unshift(fragment._id);
        style.setProperty("animations", backgroundAnimations.join(","));
      });
    },
  });

  return (
    <>
      {commonUsedAnimations.map((animation) => (
        <AnimationControlEntry
          key={animation._id}
          styles={styles}
          animation={animation}
        />
      ))}

      {commonUnusedAnimations.length ? (
        <>
          <hr />
          {commonUnusedAnimations.map((animation) => (
            <AnimationControlEntry
              key={animation._id}
              styles={styles}
              animation={animation}
            />
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
