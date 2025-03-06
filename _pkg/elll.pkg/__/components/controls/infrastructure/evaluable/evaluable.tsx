import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  ExpressionControl,
  MixedType,
  ResolvedControlProps,
  useControlValue,
} from "@repo/components";
import { Expression, expressionOf, isExpression } from "@repo/elementa";
import { ReactNode } from "react";
import { map, Observable } from "rxjs";
import { modalViews } from "../../../../views/modals/_";
import {
  editorControlMap,
  EditorControlMap,
  EditorControlType,
} from "../../control_map";

export function EvaluableControlEntry<C extends EditorControlType, T>({
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
        map={editorControlMap}
      />
    );
  }

  return (
    <ControlEntry
      variant={variant}
      label={label}
      menu={{
        title: label,
        viewId: modalViews.evaluable.id,
        props: {
          value,
          value$,
          onChange: (value: Expression) => {
            onChange?.(value as T);
          },
        },
      }}
      onRemove={onRemove}
      action={action}
    >
      {controlElement}
    </ControlEntry>
  );
}
