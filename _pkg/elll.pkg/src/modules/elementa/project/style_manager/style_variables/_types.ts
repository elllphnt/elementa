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

  sets: IStyleVariableSet[];
  sets$: Observable<IStyleVariableSet[]>;
}
