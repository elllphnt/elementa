import { createContext } from "react";
import { Modal } from "~/src/models/modal_manager";

export const ModalRendererContext = createContext<
  | {
      parent?: Modal;
      modal: Modal;
      hide: (key: number) => void;
    }
  | undefined
>(undefined);
