import { useMemo } from "react";
import { useShell } from "../../../hooks/shell";
import { ModalAffinity } from "../../../models/modal_manager";
import { SideModalOption, SideModalProviderContext } from "./_contexts";

export function ShellSideModalProvider({
  children,
  affinity,
}: {
  children: React.ReactNode;
  affinity: ModalAffinity;
}): JSX.Element {
  const shell = useShell();

  const handleShowSideModal = useMemo(() => {
    return (options: SideModalOption) => {
      return shell.showModal({
        ...options,
        affinity,
      });
    };
  }, [shell]);
  const handleHideSideModal = useMemo(() => {
    return (key?: number) => {
      return shell.hideModal(key);
    };
  }, [shell]);

  return (
    <SideModalProviderContext.Provider
      value={{
        showSideModal: handleShowSideModal,
        hideSideModal: handleHideSideModal,
        modal$: shell.modalManager.modal$(affinity),
      }}
    >
      {children}
    </SideModalProviderContext.Provider>
  );
}

export default ShellSideModalProvider;
