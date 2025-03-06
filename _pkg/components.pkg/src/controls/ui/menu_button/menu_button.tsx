import { ReactNode } from "react";
import { useControlMenu } from "~/src/control_menu/_hooks";
import { ColorAccent } from "../../_";
import { ControlProps } from "../../_type";
import { ControlButton } from "../button/button";

export function MenuButtonControl<T>({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  T,
  {
    label?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    dimmed?: boolean;
    align?: "start" | "center" | "end";
    menu?: {
      viewId?: string;
      title?: string;
      props?: any;
    };
    accent?: ColorAccent;
    action?: {
      icon: string;
      label: string;
      handler: () => void;
    };
  }
>) {
  const { openMenu } = useControlMenu();
  return (
    <ControlButton
      prefix={settings?.prefix}
      suffix={settings?.suffix}
      dimmed={settings?.dimmed}
      align={settings?.align}
      onClick={(e) => {
        openMenu({
          title: settings?.menu?.title,
          viewId: settings?.menu?.viewId ?? "",
          anchor: e.currentTarget,
          props: {
            value,
            value$,
            onChange,
            ...settings?.menu?.props,
          },
        });
      }}
      label={settings?.label}
      accent={settings?.accent}
      action={settings?.action}
    />
  );
}
