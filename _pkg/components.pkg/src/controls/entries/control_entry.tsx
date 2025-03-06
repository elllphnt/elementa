import { PropsWithChildren, ReactNode, forwardRef } from "react";
import { ControlMenuOptions } from "~/src/control_menu/_types";
import { FullControlEntry } from "./full_control_entry";
import { MiniControlEntry } from "./mini_control_entry";

export enum ControlEntryVariant {
  Mini = "mini",
  Full = "full",
}

export const ControlEntry = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    icon?: ReactNode;
    label?: ReactNode;
    variant?: ControlEntryVariant;
    menu?: ControlMenuOptions;
    active?: boolean;
    onRemove?: () => void;
    action?: {
      icon: string;
      label: string;
      handler: () => void;
      active?: boolean;
    };
    quickAction?: {
      icon: string;
      label: string;
      handler: () => void;
    };
  }>
>(function (
  {
    menu,
    active,
    label,
    variant,
    children,
    icon,
    onRemove,
    action,
    quickAction,
  },
  ref,
) {
  switch (variant) {
    case ControlEntryVariant.Full: {
      return (
        <FullControlEntry
          ref={ref}
          icon={icon}
          label={label}
          menu={menu}
          active={active}
          onRemove={onRemove}
          action={action}
          quickAction={quickAction}
        >
          {children}
        </FullControlEntry>
      );
    }
    case ControlEntryVariant.Mini: {
      return (
        <MiniControlEntry
          ref={ref}
          icon={icon}
          label={label}
          menu={menu}
          active={active}
          onRemove={onRemove}
        >
          {children}
        </MiniControlEntry>
      );
    }
    default: {
      return (
        <FullControlEntry
          ref={ref}
          icon={icon}
          label={label}
          menu={menu}
          active={active}
          onRemove={onRemove}
          action={action}
          quickAction={quickAction}
        >
          {children}
        </FullControlEntry>
      );
    }
  }
});
