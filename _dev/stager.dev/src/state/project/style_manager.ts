import {
  CssStyleSheet,
  StyleManager,
  Stylesheet,
} from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable } from "rxjs";

export class LocalStyleManager extends StyleManager {
  rootStylesheet: Stylesheet;
  rootCssStylesheet: CssStyleSheet;

  private _stylesheets = new BehaviorSubject<CssStyleSheet[]>([]);
  private _variables = new Map<string, BehaviorSubject<unknown>>();

  constructor() {
    super();
    this.rootStylesheet = new Stylesheet();
    this.rootCssStylesheet = new CssStyleSheet();
    this._stylesheets.next([this.rootCssStylesheet]);
  }

  get stylesheets(): CssStyleSheet[] {
    return this._stylesheets.value;
  }

  get stylesheets$(): Observable<CssStyleSheet[]> {
    return this._stylesheets.asObservable();
  }

  variableValue(name: string): unknown {
    return this._getOrCreateVariable(name).value;
  }

  variableValue$(name: string): Observable<unknown> {
    return this._getOrCreateVariable(name).asObservable();
  }

  setVariableValue(name: string, value: unknown): void {
    this._getOrCreateVariable(name).next(value);
  }

  addStylesheet(stylesheet: CssStyleSheet): void {
    const current = this._stylesheets.value;
    this._stylesheets.next([...current, stylesheet]);
  }

  private _getOrCreateVariable(name: string): BehaviorSubject<unknown> {
    if (!this._variables.has(name)) {
      this._variables.set(name, new BehaviorSubject<unknown>(null));
    }
    return this._variables.get(name)!;
  }
}
