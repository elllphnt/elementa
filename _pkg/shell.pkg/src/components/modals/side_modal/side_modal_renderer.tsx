import { useContext } from "react";
import { Modal } from "~/src/models/modal_manager";
import { useObservable } from "@repo/utils";
import { ModalRendererContext } from "../_contexts";
import { useSideModalConsumer } from "./_hooks";

export function SideModalRenderer({ children }: { children: React.ReactNode }) {
  const { modal: parent } = useContext(ModalRendererContext) ?? {};
  const { hideSideModal, modal$ } = useSideModalConsumer();
  const modal = useObservable(modal$, undefined as Modal | undefined);

  if (!modal) {
    return <></>;
  } else {
    return (
      <ModalRendererContext.Provider
        value={{
          parent,
          modal,
          hide: (key) => {
            hideSideModal(key);
          },
        }}
      >
        {children}
      </ModalRendererContext.Provider>
    );
  }
}
