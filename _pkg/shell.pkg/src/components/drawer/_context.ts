import { createContext } from "react";
import { BehaviorSubject } from "rxjs";

export const DrawerContext = createContext<{
  loading$: BehaviorSubject<boolean>;
} | null>(null);
