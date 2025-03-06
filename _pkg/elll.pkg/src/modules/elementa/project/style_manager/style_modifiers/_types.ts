import { Observable } from "rxjs";

export interface IStyleModifier {
  id: string;
}
export interface IStyleModifierSheet {
  modifiers: IStyleModifier[];
  modifiers$: Observable<IStyleModifier[]>;

  modifier(id: string): IStyleModifier | undefined;
  modifier$(id: string): Observable<IStyleModifier | undefined>;
}
