import { PropsWithChildren } from "react";
import { useShell } from "~/src/hooks/shell";
import { ModalAffinity } from "~/src/models/modal_manager";
import { useObservable } from "@repo/utils";
import { ModalRendererContext } from "./_contexts";

export function ShellModalRenderer({
  affinity,
  children,
}: PropsWithChildren<{
  affinity: ModalAffinity;
}>) {
  const shell = useShell();
  const modal = useObservable(
    shell.modalManager.modal$(affinity),
    shell.modalManager.modal(affinity),
  );

  if (!modal) {
    return <></>;
  } else {
    return (
      <ModalRendererContext.Provider
        value={{
          modal,
          hide: (key) => {
            shell.hideModal(key);
          },
        }}
      >
        {children}
      </ModalRendererContext.Provider>
    );
  }
}
