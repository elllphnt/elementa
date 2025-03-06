import { elllIcons16, Icon, TreeEntry, useAction } from "@repo/components";
import { ElementHandle, ElementInstance } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { appearanceActivatorToText } from "./_utils/appearance";

function AddAppearanceAction({ handler }: { handler: () => void }) {
  useAction({
    title: "Add Appearance",
    icon: elllIcons16.plus,
    handler,
  });
  return <></>;
}

function AppearanceEntry({
  appearance,
  onClick,
  onRemove,
}: {
  appearance: Appearance;
  onClick: () => void;
  onRemove: () => void;
}) {
  const name = useObservable(appearance.name$, appearance.name);
  const activator = useObservable(appearance.activator$, appearance.activator);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.appearances} />}
      onClick={onClick}
      actions={[
        {
          icon: <Icon name={elllIcons16.cross} />,
          handler: onRemove,
        },
      ]}
    >
      {name ??
        (activator ? appearanceActivatorToText(activator) : "Appearance")}
    </TreeEntry>
  );
}

export function ElementAppearancesControlSheet({
  instances,
  selection,
}: {
  instances: ElementInstance[];
  selection: ElementHandle[];
}): JSX.Element {
  const appearances = useObservable(
    instances[0].entity.appearances$,
    instances[0].entity.appearances,
  );

  return (
    <>
      <AddAppearanceAction
        handler={() => {
          selection.forEach((handle) => {
            const appearance = new Appearance({});
            appearance.setActivator({
              type: "state",
              state: "hover",
            } as AppearanceStateActivatorData);
            handle.entity.addAppearance(appearance);
            handle.setFocusedStyleClassName(appearance.style.className);
          });
        }}
      />
      {appearances.map((appearance) => (
        <AppearanceEntry
          key={appearance.key}
          appearance={appearance}
          onClick={() => {
            selection.forEach((handle) => {
              handle.setFocusedStyleClassName(appearance.style.className);
            });
          }}
          onRemove={() => {
            instances.forEach((instance) => {
              instance.entity.removeAppearance(appearance);
            });
          }}
        />
      ))}
    </>
  );
}
