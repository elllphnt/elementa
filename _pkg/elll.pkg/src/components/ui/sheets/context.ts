import { createContext, useContext, useEffect } from "react";
import { Observable, of } from "rxjs";

export type SheetAction = {
  key: string;
  title: string;
  icon: string;
  active?: boolean;
  active$?: Observable<boolean>;
  handler: () => void;
};

export const SheetContext = createContext<{
  actions$: Observable<SheetAction[]>;
  actions: SheetAction[];
  root$: Observable<HTMLElement | undefined>;
  root: HTMLElement | undefined;
  hover$: Observable<boolean>;
  hover: boolean;

  registerAction: (action: Omit<SheetAction, "key">) => string;
  unregisterAction: (key: string) => void;
}>({
  actions$: of([]),
  actions: [],
  root$: of(undefined),
  root: undefined,
  hover$: of(false),
  hover: false,

  registerAction: () => "",
  unregisterAction: () => {},
});

export function useSheet() {
  return useContext(SheetContext);
}
export function useSheetAction(
  action: Omit<SheetAction, "key">,
  dependencies: any[] = [],
) {
  const context = useContext(SheetContext);

  useEffect(() => {
    const key = context.registerAction(action);
    return () => {
      context.unregisterAction(key);
    };
  }, [context, ...dependencies]);
}
