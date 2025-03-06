import { useAnchorProvider } from "@repo/components";
import { useCallback, useContext } from "react";
import {
  SideModalConsumerContext,
  SideModalProviderContext,
} from "./_contexts";

export function useSideModalProvider() {
  const { getAnchor } = useAnchorProvider();
  const { showSideModal, hideSideModal, modal$ } = useContext(
    SideModalProviderContext,
  );

  const _showSideModal: typeof showSideModal = useCallback((modal) => {
    return showSideModal({
      ...modal,
      anchor: modal.anchor ?? getAnchor() ?? undefined,
    });
  }, []);

  return { showSideModal: _showSideModal, hideSideModal, modal$ };
}
export function useSideModalConsumer() {
  const provider = useContext(SideModalProviderContext);
  const consumer = useContext(SideModalConsumerContext);
  return {
    hideSideModal: consumer?.hideSideModal ?? provider.hideSideModal,
    modal$: consumer?.modal$ ?? provider.modal$,
  };
}
