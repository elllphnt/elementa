import {
  elllIcons16,
  Icon,
  TreeEntry,
  useAction,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables, useObservable } from "@repo/utils";
import { useElllProject } from "~/src/hooks/project/project";
import { resolveArrayIntersection } from "~/src/libs/utils";

function TransitionEntry({
  transitionId,
  onRemove,
}: {
  transitionId: string;
  onRemove: () => void;
}) {
  const { openMenu } = useControlMenu();
  const transition = useProjectTransition(transitionId);
  const name = useObservable(transition?.name$, transition?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={(e) => {
        openMenu({
          anchor: e.currentTarget,
          viewId: transitionControlViews.menu.id,
          title: "Transition",
          props: {
            transition,
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
      {name ?? "Transition"}
    </TreeEntry>
  );
}

export function StyleTransitionsControlSheet({
  styles,
}: {
  styles: Style[];
}): JSX.Element {
  const project = useElllProject();
  const stylesKey = styles.map((style) => style.key).join(",");
  const transitions = useManyObservables(
    styles.map((style) => style.propertyValue$("transitions")),
    styles.map((style) => style.propertyValue("transitions")),
    stylesKey,
  ).filter(Boolean) as string[][];
  const { openMenu, closeMenu } = useControlMenu();

  let commonTransitions = resolveArrayIntersection(transitions);

  useAction({
    title: "Add Transition",
    icon: elllIcons16.plus,
    index: 1,
    handler: () => {
      const newTransition = new Transition({ project });
      newTransition.setDuration({
        value: 300,
        unit: "ms",
      });
      newTransition.setTimingFunction("ease");
      newTransition.setProperties(["all"]);
      project.transitionStore.addTransition(newTransition);
      styles.forEach((style) => {
        let transitions = style.propertyValue("transitions");
        transitions = transitions
          ? [...transitions, newTransition.id]
          : [newTransition.id];
        style.setProperty("transitions", transitions);
      });
    },
  });
  useAction({
    title: "All Transitions",
    icon: elllIcons16.folderOpen,
    index: 0,
    handler: (e) => {
      openMenu({
        anchor: e.currentTarget as any,
        viewId: transitionControlViews.browser.id,
        title: "All Transitions",
        props: {
          onSelect: (transition: Transition) => {
            styles.forEach((style) => {
              let transitions = style.propertyValue("transitions");
              transitions = transitions
                ? [...transitions, transition.id]
                : [transition.id];
              style.setProperty("transitions", transitions);
            });
            closeMenu();
          },
        },
      });
    },
  });

  return (
    <>
      {commonTransitions.map((transition) => (
        <TransitionEntry
          key={transition}
          transitionId={transition}
          onRemove={() => {
            styles.forEach((style) => {
              let transitions = style.propertyValue("transitions");
              transitions = transitions?.filter((t) => t !== transition);
              style.setProperty("transitions", transitions);
            });
          }}
        />
      ))}
    </>
  );
}
