import { BaseControlType, FullControlEntry } from "@repo/components";
import { map } from "rxjs";
import { ValueSetControl } from "../../../../../../../components/controls/infrastructure/value_set/value_set";
import { useCommonReactiveValue } from "../../../../../../../hooks/utils/reactivity";

function ExpressionActivatorOptions({
  appearances,
}: {
  appearances: Appearance[];
}) {
  return (
    <FullControlEntry label="Expression">
      <ValueSetControl
        items={appearances}
        value$={(appearance) =>
          appearance.activator$.pipe(
            map((activator) =>
              activator
                ? (activator as AppearanceExpressionActivatorData).expression
                : "",
            ),
          )
        }
        value={(appearance) =>
          (appearance.activator as AppearanceExpressionActivatorData)
            ?.expression
        }
        vKey={appearances.map((appearance) => appearance.key).join(",")}
        onChange={(appearance, value) => {
          if (!value) {
            appearance.setActivator(undefined);
          } else {
            appearance.setActivator({
              ...appearance.activator,
              expression: value,
            } as AppearanceExpressionActivatorData);
          }
        }}
        control={BaseControlType.Expression}
      />
    </FullControlEntry>
  );
}

function StateActivatorOptions({ appearances }: { appearances: Appearance[] }) {
  return (
    <FullControlEntry label="State">
      <ValueSetControl
        items={appearances}
        value$={(appearance) =>
          appearance.activator$.pipe(
            map((activator) =>
              activator
                ? (activator as AppearanceStateActivatorData).state
                : "",
            ),
          )
        }
        value={(appearance) =>
          (appearance.activator as AppearanceStateActivatorData)?.state
        }
        vKey={appearances.map((appearance) => appearance.key).join(",")}
        onChange={(appearance, value) => {
          if (!value) {
            appearance.setActivator(undefined);
          } else {
            appearance.setActivator({
              ...appearance.activator,
              state: value,
            } as AppearanceStateActivatorData);
          }
        }}
        control={BaseControlType.Select}
        controlSettings={{
          options: [
            { value: "hover", label: "Hover" },
            { value: "press", label: "Press" },
            { value: "focus", label: "Focus" },
            { value: "disabled", label: "Disabled" },
          ],
        }}
      />
    </FullControlEntry>
  );
}

export function ElementAppearanceSheet({
  appearances,
}: {
  appearances: Appearance[];
}): JSX.Element {
  const activatorType = useCommonReactiveValue(
    appearances.map((appearance) =>
      appearance.activator$.pipe(
        map((activator) => (activator ? activator.type : "")),
      ),
    ),
    appearances.map((appearance) => appearance.activator?.type),
    appearances.map((appearance) => appearance.key).join(","),
  );

  return (
    <>
      <FullControlEntry label="Name">
        <ValueSetControl
          items={appearances}
          value$={(appearance) => appearance.name$}
          value={(appearance) => appearance.name}
          vKey={appearances.map((appearance) => appearance.key).join(",")}
          onChange={(appearance, value) => {
            appearance.setName(value);
          }}
          control={BaseControlType.Text}
        />
      </FullControlEntry>
      <FullControlEntry label="Activator">
        <ValueSetControl
          items={appearances}
          value$={(appearance) =>
            appearance.activator$.pipe(
              map((activator) => (activator ? activator.type : "")),
            )
          }
          value={(appearance) => appearance.activator?.type}
          vKey={appearances.map((appearance) => appearance.key).join(",")}
          onChange={(appearance, value) => {
            if (!value) {
              appearance.setActivator(undefined);
            } else {
              appearance.setActivator({
                ...appearance.activator,
                type: value,
              });
            }
          }}
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              { value: "expression", label: "Expression" },
              { value: "state", label: "State" },
            ],
          }}
        />
      </FullControlEntry>

      {activatorType === "expression" && (
        <ExpressionActivatorOptions appearances={appearances} />
      )}
      {activatorType === "state" && (
        <StateActivatorOptions appearances={appearances} />
      )}
    </>
  );
}
