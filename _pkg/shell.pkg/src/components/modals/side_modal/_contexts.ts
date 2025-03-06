import { createContext } from "react";
import { Observable } from "rxjs";
import { Modal, ModalOption } from "~/src/models/modal_manager";

export type SideModalOption = Omit<ModalOption, "affinity">;

export const SideModalProviderContext = createContext<{
  showSideModal: (modal: SideModalOption) => void;
  hideSideModal: (key?: number) => void;
  modal$: Observable<Modal | undefined>;
}>({
  showSideModal: () => {},
  hideSideModal: () => {},
  modal$: new Observable<Modal | undefined>(),
});

export const SideModalConsumerContext = createContext<
  | {
      hideSideModal: (key?: number) => void;
      modal$: Observable<Modal | undefined>;
    }
  | undefined
>(undefined);
