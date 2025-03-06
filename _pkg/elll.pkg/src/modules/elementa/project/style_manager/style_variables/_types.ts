import { Observable } from "rxjs";
import { IElllStyleManager } from "../_types";

export interface IStyleVariable {
  id: string;
  setId: string;
}
export interface IStyleVariableSet {
  id: string;
}
export interface IStyleVariableSheet {
  styleManager: IElllStyleManager;

  variables: IStyleVariable[];
  variables$: Observable<IStyleVariable[]>;

  sets: IStyleVariableSet[];
  sets$: Observable<IStyleVariableSet[]>;
}
