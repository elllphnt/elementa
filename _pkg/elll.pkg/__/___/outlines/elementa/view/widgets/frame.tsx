import { TreeContext, elllIcons16 } from "@repo/components";
import { FrameWidgetHandle } from "@repo/elementa-interactor";
import { useObservable } from "@repo/utils";
import { useContext } from "react";
import { FragmentOutline } from "../fragment";
import { HandleOutlineEntry, useHandleOpenState } from "../handle";

export function FrameWidgetOutline({
  widget,
  stateKey,
}: {
  widget: FrameWidgetHandle;
  stateKey: string[];
}) {
  const context = useContext(TreeContext);
  const fragment = useObservable(widget.fragment$, widget.fragment);
  const [open, setOpen] = useHandleOpenState(widget);

  return (
    <>
      <HandleOutlineEntry
        handle={widget}
        container={!!fragment}
        icon={elllIcons16.toolWidget}
        open={open}
        setOpen={setOpen}
        fallbackName="Frame"
      />
      {open ? (
        <TreeContext.Provider
          value={{
            ...context,
            depth: context.depth + 1,
          }}
        >
          {fragment ? (
            <FragmentOutline
              key={fragment.key}
              fragment={fragment}
              stateKey={[...stateKey, "fragment"]}
            />
          ) : (
            <></>
          )}
        </TreeContext.Provider>
      ) : null}
    </>
  );
}
