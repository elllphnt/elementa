import { Expression, expressionOf, isExpression } from "@elllphnt/elll-element";
import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  elllIcons16,
  ExpressionControl,
  MixedType,
  ResolvedControlProps,
  useControlValue,
} from "@repo/components";
import { ReactNode } from "react";
import { map, Observable } from "rxjs";
import {
  EditorControlMap,
  elllControlMap,
  ElllControlType,
} from "../../_types";

export function EvaluableControlEntry<C extends ElllControlType, T>({
  label,
  control,
  controlSettings,
  value$,
  value,
  onChange,
  variant,
  onRemove,
  action,
}: {
  label: string;
  control: C;
  variant?: ControlEntryVariant;
  value$?: Observable<T | MixedType | undefined>;
  value?: T | MixedType | undefined;
  onChange?: (value: T | Expression | undefined) => void;
  noExpression?: boolean;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
  onRemove?: () => void;
  action?: {
    icon: string;
    label: string;
    handler: () => void;
  };
}) {
  const currentValue = useControlValue(value$, value);
  const isExpr = isExpression(currentValue);

  let controlElement: ReactNode;

  if (isExpr) {
    controlElement = (
      <ExpressionControl
        value={expressionOf(currentValue)}
        value$={value$?.pipe(map(expressionOf))}
        onChange={onChange}
        settings={{
          title: label,
        }}
      />
    );
  } else {
    controlElement = (
      <Control
        value={currentValue}
        value$={value$}
        onChange={onChange}
        type={control as any}
        settings={controlSettings}
        map={elllControlMap}
      />
    );
  }

  return (
    <ControlEntry
      variant={variant}
      label={label}
      // menu={{
      //   title: label,
      //   viewId: modalViews.evaluable.id,
      //   props: {
      //     value,
      //     value$,
      //     onChange: (value: Expression) => {
      //       onChange?.(value as T);
      //     },
      //   },
      // }}
      onRemove={onRemove}
      action={action}
      quickAction={
        !isExpr
          ? {
              icon: elllIcons16.state,
              label: "Switch to Expression",
              handler: () => {
                const nextValue = isExpr
                  ? value
                  : { __expression: "", fallback: value };
                // onChange?.(nextValue);
                console.log("Switch to Variable", nextValue);
              },
            }
          : undefined
      }
    >
      {controlElement}
    </ControlEntry>
  );
}
