import {
  elllIcons16,
  FullControlEntry,
  Icon,
  MenuButtonControl,
} from "@repo/components";
import { ElementInstance } from "@repo/elementa";
import { useObservable } from "@repo/utils";

function InteractionControlEntry({
  interaction,
  onRemove,
}: {
  interaction: any;
  onRemove: () => void;
}): JSX.Element {
  const type = useObservable(interaction.type$, interaction.type);
  const handler = useObservable(interaction.handler$, interaction.handler);

  return (
    <FullControlEntry label={type || "event"}>
      <MenuButtonControl
        settings={{
          prefix: (
            <Icon
              color="currentColor"
              className="el-h-4 el-w-4"
              name={elllIcons16.routine}
            />
          ),
          menu: {
            title: "Interaction",
            viewId: "modalViews.interaction.id",
            props: {
              interaction,
              onRemove,
            },
          },
          label: handler?.__expression,
        }}
      />
    </FullControlEntry>
  );
}

function NewInteractionControlEntry({
  element,
}: {
  element: ElementInstance;
}): JSX.Element {
  const handleAddInteraction = () => {};

  return (
    <FullControlEntry>
      <button
        onClick={handleAddInteraction}
        className="el-h-7 el-flex gap-2 el-items-center el-text-fg-500 hover:el-text-fg-500"
      >
        <Icon name={elllIcons16.plus} />
        Add Interaction
      </button>
    </FullControlEntry>
  );
}

export function ElementInteractionsSheet({
  instances,
}: {
  instances: ElementInstance[];
}): JSX.Element {
  const element = instances[0];
  const interactions = useObservable(
    element.entity.interactions$,
    element.entity.interactions,
  );

  return (
    <>
      {/* {interactions.map((interaction) => {
        return (
          <InteractionControlEntry
            key={interaction.key}
            interaction={interaction}
            onRemove={() => element.entity.removeInteraction(interaction)}
          />
        );
      })} */}
      <NewInteractionControlEntry element={element} />
    </>
  );
}
