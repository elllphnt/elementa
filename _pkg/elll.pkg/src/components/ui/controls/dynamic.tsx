import {
  Expression,
  isExpression,
  isReference,
  isVarRef,
} from "@elllphnt/elll-element";
import {
  ColorAccent,
  ControlButton,
  ControlEntry,
  ControlEntryVariant,
  elllIcons16,
  Icon,
  MixedType,
  ResolvedControlProps,
  useControlMenu,
  useControlValue,
} from "@repo/components";
import { ReactNode, useRef } from "react";
import { Observable } from "rxjs";
import { keys } from "~/src/libs/keys";
import { DynamicType } from "~/src/views/modals/dynamics/_dynamics";
import { EditorControlMap, ElllControlType } from "./_types";
import { Control } from "./control";

const dynamicControlMap: Record<
  string | number,
  {
    icon: string;
    colorAccent: ColorAccent;
    match: (value: any) => boolean;
    label: (value: any) => string;
    remove: (value: any) => any;
  }
> = {
  [DynamicType.StyleVariable]: {
    icon: elllIcons16.variable,
    colorAccent: "blue",
    match: isVarRef,
    label: (value) => value.__varRef,
    remove: (value) => (isVarRef(value) ? value.fallback : value),
  },
  [DynamicType.Expression]: {
    icon: elllIcons16.model,
    colorAccent: "green",
    match: isExpression,
    label: (value) => value.__expression,
    remove: (value) => (isVarRef(value) ? value.fallback : undefined),
  },
  [DynamicType.DriveFile]: {
    icon: elllIcons16.file,
    colorAccent: "purple",
    match: (value) =>
      isReference(value) && value.__reference.type === "drive-file",
    label: (value) => value.__reference.id,
    remove: (value) => (isReference(value) ? value.fallback : value),
  },
};

export function DynamicControlEntry<C extends ElllControlType, T>({
  label,
  control,
  controlSettings,
  value$,
  value,
  onChange,
  variant,
  onRemove,
  action,
  dynamics,
}: {
  label: string;
  control: C;
  variant?: ControlEntryVariant;
  value$?: Observable<T | MixedType | undefined>;
  value?: T | MixedType | undefined;
  onChange?: (value: T | Expression | undefined) => void;
  controlSettings?: ResolvedControlProps<EditorControlMap, C>["settings"];
  onRemove?: () => void;
  action?: {
    icon: string;
    label: string;
    handler: () => void;
  };
  dynamics?: Record<string, any>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { openMenu } = useControlMenu();
  const currentValue = useControlValue(value$, value);

  const hasValue = currentValue !== undefined && currentValue !== "unset";

  let controlElement: ReactNode;
  let isDynamic = false;

  for (const type in dynamics ?? {}) {
    const dynamic = dynamicControlMap[type];
    if (dynamic && dynamic.match(currentValue)) {
      controlElement = (
        <ControlButton
          key={type}
          accent={dynamic.colorAccent}
          prefix={<Icon name={dynamic.icon} />}
          label={dynamic.label(currentValue)}
          onClick={() => {
            openMenu({
              anchor: ref.current ?? undefined,
              title: label,
              viewId: keys.views.modals.dynamic,
              props: {
                value$,
                value,
                onChange,
                dynamics,
                initialType: type,
              },
            });
          }}
          action={{
            icon: elllIcons16.cross,
            label: "Remove",
            handler: () => onChange?.(dynamic.remove(currentValue)),
          }}
        />
      );
      isDynamic = true;
      break;
    }
  }

  if (!isDynamic) {
    controlElement = (
      <Control
        value={currentValue}
        value$={value$}
        onChange={onChange}
        type={control as any}
        settings={controlSettings}
      />
    );
  }

  return (
    <ControlEntry
      ref={ref}
      active={hasValue}
      variant={variant}
      label={label}
      onRemove={hasValue ? onRemove : undefined}
      action={action}
      quickAction={{
        icon: elllIcons16.ai,
        label: "Use Dynamic",
        handler: () =>
          openMenu({
            anchor: ref.current ?? undefined,
            title: label,
            viewId: keys.views.modals.dynamic,
            props: {
              value$,
              value,
              onChange,
              dynamics,
            },
          }),
      }}
    >
      {controlElement}
    </ControlEntry>
  );
}
