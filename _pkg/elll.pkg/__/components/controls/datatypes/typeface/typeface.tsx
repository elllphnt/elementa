import {
  ControlProps,
  elllIcons16,
  Icon,
  MenuButtonControl,
  mixed,
  useControlValue,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import React from "react";
import { Observable } from "rxjs";
import { useProjectTypeface } from "../../../../hooks/project/project";
import { typefaceControlViews } from "./_views";

export function TypefaceControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  string | undefined,
  {
    title?: string;
    variantValue$?: Observable<any>;
    variantValue?: any;
    setVariantValue?: (value: string) => void;
  }
>) {
  const currentValue = useControlValue(value$, value);
  let text: React.ReactNode;

  let isMixed = false;
  let typefaceId: string | undefined = undefined;

  if (currentValue === mixed) {
    isMixed = true;
  } else if (typeof currentValue === "string") {
    typefaceId = currentValue;
  }

  const typeface = useProjectTypeface(typefaceId ?? "");
  const definition = useObservable(typeface?.definition$, typeface?.definition);
  const isNotFound = typefaceId && !typeface;

  if (isNotFound) {
    text = "Not found";
  } else if (typeface) {
    text = (
      <span>
        {definition?.family ?? <span className="el-text-fg-400">unnamed</span>}
      </span>
    );
  } else if (isMixed) {
    text = <span className="el-text-fg-400">mixed</span>;
  } else {
    text = <span className="el-text-fg-400">unset</span>;
  }

  return (
    <MenuButtonControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        label: text,
        prefix: <Icon name={elllIcons16.font} />,
        menu: {
          title: settings?.title ?? "Typeface",
          viewId: typefaceControlViews.selector.id,
          props: {
            settings: {
              variantValue$: settings?.variantValue$,
              variantValue: settings?.variantValue,
              setVariantValue: settings?.setVariantValue,
            },
          },
        },
        accent: isNotFound ? "red" : undefined,
      }}
    />
  );
}
