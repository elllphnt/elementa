import {
  ContextMenuManagerContext,
  ControlMenuContext,
  ControlMenuOptions,
  controlMenuViews,
  IconStoreContext,
  ViewStoreContext,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useMemo } from "react";
import ShellContext from "~/src/contexts/shell";
import WorkspaceContext from "~/src/contexts/workspace";
import { Shell } from "~/src/models/shell";
import { useDragDropObserver } from "../drag_drop/_hooks";
import WorkspaceView from "../workspace/workspace";

export function ShellView({ shell }: { shell: Shell }): JSX.Element {
  const workspace = useObservable(shell.workspace$, shell.workspace);

  // drag drop
  useDragDropObserver();

  // load internal views
  useMemo(() => {
    shell.viewStore.loadViews(...Object.values(controlMenuViews));
  }, [shell]);

  const handleOpenMenu = (options: ControlMenuOptions) => {
    shell.showModal({
      affinity: "workspace",
      viewId: controlMenuViews.shell.id,
      anchor: options.anchor,
      contexts: options.contexts,
      props: {
        menu: options,
      },
    });
  };
  const handleCloseMenu = () => {
    shell.hideModal();
  };

  return (
    <ShellContext.Provider value={shell}>
      <ViewStoreContext.Provider value={shell.viewStore}>
        <IconStoreContext.Provider value={shell.iconStore}>
          <ContextMenuManagerContext.Provider value={shell.contextMenuManager}>
            <ControlMenuContext.Provider
              value={{ openMenu: handleOpenMenu, closeMenu: handleCloseMenu }}
            >
              {workspace ? (
                <WorkspaceContext.Provider value={workspace}>
                  <WorkspaceView key={workspace.key} workspace={workspace} />
                </WorkspaceContext.Provider>
              ) : (
                <></>
              )}
            </ControlMenuContext.Provider>
          </ContextMenuManagerContext.Provider>
        </IconStoreContext.Provider>
      </ViewStoreContext.Provider>
    </ShellContext.Provider>
  );
}

export default ShellView;
