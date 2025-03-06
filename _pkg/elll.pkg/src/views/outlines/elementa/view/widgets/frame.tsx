import { TreeContext, elllIcons16 } from "@repo/components";
import { FrameWidgetHandle } from "@repo/elementa-interactor";
import { useObservable } from "@repo/utils";
import { useContext } from "react";
import { FragmentOutline } from "../fragment";
import { EntityHandleOutlineEntry } from "../handle";

export function FrameWidgetOutline({
  widget,
  stateKey,
}: {
  widget: FrameWidgetHandle;
  stateKey: string[];
}) {
  const fragment = useObservable(widget.fragment$, widget.fragment);

  return (
    <EntityHandleOutlineEntry
      handle={widget}
      container={!!fragment}
      icon={elllIcons16.toolWidget}
      fallbackName="Frame"
      content={() =>
        fragment ? (
          <FragmentOutline
            key={fragment.key}
            fragment={fragment}
            stateKey={[...stateKey, "fragment"]}
          />
        ) : (
          <></>
        )
      }
    />
  );
}
