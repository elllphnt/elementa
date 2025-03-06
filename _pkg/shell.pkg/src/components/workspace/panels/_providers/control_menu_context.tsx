import {
  ControlMenuContext,
  ControlMenuOptions,
  controlMenuViews,
  useAnchorProvider,
} from "@repo/components";
import { PropsWithChildren, useCallback } from "react";
import { useShell } from "~/src/hooks/shell";
import { useSideModalConsumer, useSideModalProvider } from "../../../modals/_";

export function SideControlMenuContextProvider({
  children,
}: PropsWithChildren<{}>) {
  const { getAnchor } = useAnchorProvider();
  const { hideSideModal } = useSideModalConsumer();
  const { showSideModal } = useSideModalProvider();
  const shell = useShell();

  const openMenu = useCallback((options: ControlMenuOptions) => {
    if (options.affinity === "workspace") {
      shell.showModal({
        affinity: "workspace",
        viewId: controlMenuViews.shell.id,
        anchor: options.anchor ?? getAnchor(),
        contexts: options.contexts,
        props: {
          menu: options,
        },
      });
    } else {
      showSideModal({
        viewId: controlMenuViews.shell.id,
        anchor: options.anchor ?? getAnchor(),
        contexts: options.contexts,
        props: {
          menu: options,
        },
      });
    }
  }, []);

  const closeMenu = useCallback(() => {
    hideSideModal();
  }, []);

  return (
    <ControlMenuContext.Provider
      value={{
        openMenu,
        closeMenu,
      }}
    >
      {children}
    </ControlMenuContext.Provider>
  );
}
