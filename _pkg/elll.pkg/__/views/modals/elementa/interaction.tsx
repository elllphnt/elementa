import { Interaction } from "@repo/elementa";
import { useObservable } from "@repo/utils";

export function InteractionMenu({
  interaction,
  onRemove,
}: {
  interaction: Interaction;
  onRemove: () => void;
}): JSX.Element {
  const type = useObservable(interaction.type$, interaction.type);
  const handler = useObservable(interaction.handler$, interaction.handler);

  return (
    <>
      <FullControlEntry label="Type">
        <SelectControl
          value={type}
          onChange={(value) => interaction.setType(value)}
          settings={{
            options: [
              { label: "Click", value: "click" },
              { label: "KeyDown", value: "keydown" },
              { label: "KeyPress", value: "keypress" },
              { label: "KeyUp", value: "keyup" },
              { label: "MouseDown", value: "mousedown" },
              { label: "MouseUp", value: "mouseup" },
              { label: "MouseEnter", value: "mouseenter" },
              { label: "MouseLeave", value: "mouseleave" },
              { label: "MouseMove", value: "mousemove" },
              { label: "MouseOut", value: "mouseout" },
              { label: "MouseOver", value: "mouseover" },
            ],
          }}
        />
      </FullControlEntry>

      <RowControlContainer>
        <ExpressionControl
          value={handler}
          onChange={(value) => interaction.setHandler(value)}
        />
      </RowControlContainer>

      <RowControlContainer>
        <ControlButton label="Remove" align="center" onClick={onRemove} />
      </RowControlContainer>
    </>
  );
}
