import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { Transition } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useProjectTransitions } from "../../../../hooks/project/transitions";
import { ElllProject } from "../../../../libs/project/project";

function TransitionEntry({
  transition,
  onClick,
}: {
  transition: Transition;
  onClick: () => void;
}) {
  const name = useObservable(transition?.name$, transition?.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={onClick}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: () => {
            (
              transition.project as ElllProject
            ).transitionStore.removeTransition(transition);
          },
        },
      ]}
    >
      {name ?? "Transition"}
    </TreeEntry>
  );
}

export function TransitionBrowser({
  onSelect,
}: {
  onSelect: (transition: Transition) => void;
}) {
  const transitions = useProjectTransitions();
  return (
    <>
      {transitions.map((transition) => (
        <TransitionEntry
          key={transition.id}
          transition={transition}
          onClick={() => onSelect(transition)}
        />
      ))}
    </>
  );
}
