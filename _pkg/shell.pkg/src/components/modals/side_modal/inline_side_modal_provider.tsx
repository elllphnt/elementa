import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { Modal } from "../../../models/modal_manager";
import { SideModalProviderContext } from "./_contexts";

export function InlineSideModalProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const modalKey = useRef<number>(0);
  const modal$ = useRef<BehaviorSubject<Modal | undefined>>(
    new BehaviorSubject<Modal | undefined>(undefined),
  );

  return (
    <SideModalProviderContext.Provider
      value={{
        showSideModal: (options) => {
          modal$.current.next({
            ...options,
            key: modalKey.current++,
            affinity: "activity",
          });
        },
        hideSideModal: (key?: number) => {
          if (key !== undefined) {
            if (modal$.current.value?.key === key) {
              modal$.current.next(undefined);
            }
          } else {
            modal$.current.next(undefined);
          }
        },
        modal$: modal$.current,
      }}
    >
      {children}
    </SideModalProviderContext.Provider>
  );
}

export default InlineSideModalProvider;
