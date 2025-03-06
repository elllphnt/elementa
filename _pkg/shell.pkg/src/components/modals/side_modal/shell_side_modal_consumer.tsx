import { useMemo } from "react";
import { useShell } from "~/src/hooks/shell";
import { ModalAffinity } from "~/src/models/modal_manager";
import { SideModalConsumerContext } from "./_contexts";

export function ShellSideModalConsumer({
  children,
  affinity,
}: {
  children: React.ReactNode;
  affinity: ModalAffinity;
}): JSX.Element {
  const shell = useShell();

  const handleHideSideModal = useMemo(() => {
    return (key?: number) => {
      return shell.hideModal(key);
    };
  }, [shell]);

  return (
    <SideModalConsumerContext.Provider
      value={{
        hideSideModal: handleHideSideModal,
        modal$: shell.modalManager.modal$(affinity),
      }}
    >
      {children}
    </SideModalConsumerContext.Provider>
  );
}

export default ShellSideModalConsumer;
