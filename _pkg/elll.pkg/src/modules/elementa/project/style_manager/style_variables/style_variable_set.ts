import {
  CssSelector,
  CssStyleData,
  ElllSelectorData,
  StyleVariableData,
  StyleVariableSetData,
  variableSetToCss,
} from "@elllphnt/elll-element";
import { CssStyleRule, RuleCssStyleSheet } from "@repo/elementa-models";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map, Observable, of } from "rxjs";
import { genId } from "~/src/libs/id";
import { IStyleVariableSheet } from "./_types";

export class VariableSetStyleRule extends CssStyleRule {
  variableSet: StyleVariableSet;

  get selectors(): CssSelector[] {
    return [[":root"]];
  }
  get selectors$(): Observable<CssSelector[]> | undefined {
    return of([[":root"]]);
  }
  get styleData(): CssStyleData {
    return this.variableSet.css;
  }
  get styleData$(): Observable<CssStyleData> {
    return this.variableSet.css$;
  }

  constructor({ variableSet }: { variableSet: StyleVariableSet }) {
    super();
    this.variableSet = variableSet;
  }
}

export class StyleVariableSetStylesheet extends RuleCssStyleSheet {
  variableSet: StyleVariableSet;
  className: string;
  target: string;
  private _rule: VariableSetStyleRule;

  get rules(): CssStyleRule[] {
    return [this._rule];
  }
  get rules$(): Observable<CssStyleRule[]> {
    return of([this._rule]);
  }

  constructor({ variableSet }: { variableSet: StyleVariableSet }) {
    super();
    this.variableSet = variableSet;
    this.className = `style-variable-set-${variableSet.id}`;
    this.target = this.className;
    this._rule = new VariableSetStyleRule({ variableSet });
  }
}

export class StyleVariableSet
  extends Disposable
  implements Datafiable<StyleVariableSetData>
{
  readonly id: string;
  readonly sheet: IStyleVariableSheet;
  readonly styleSheet: StyleVariableSetStylesheet;

  private _name$ = new BehaviorSubject<string | undefined>(undefined);
  private _datatype$ = new BehaviorSubject<string | undefined>(undefined);
  private _variables$ = new BehaviorSubject<StyleVariableData[]>([]);
  private _modes$ = new BehaviorSubject<ElllSelectorData[]>([]);

  get name() {
    return this._name$.value;
  }
  get name$() {
    return this._name$.asObservable();
  }

  get datatype() {
    return this._datatype$.value;
  }
  get datatype$() {
    return this._datatype$.asObservable();
  }

  get modes() {
    return this._modes$.value;
  }
  get modes$() {
    return this._modes$.asObservable();
  }

  get variables() {
    return this._variables$.value;
  }
  get variables$() {
    return this._variables$.asObservable();
  }

  get data(): StyleVariableSetData {
    return {
      id: this.id,
      name: this.name,
      datatype: this.datatype,
      modes: this.modes,
      variables: this.variables,
    };
  }
  get data$() {
    return combineLatest([
      this.name$,
      this.datatype$,
      this.modes$,
      this.variables$,
    ]).pipe(
      map(([name, datatype, modes, variables]) => ({
        id: this.id,
        name,
        datatype,
        modes,
        variables,
      })),
    );
  }

  get css() {
    const modifiers = this.sheet.styleManager.modifiersByName;
    const [css, error] = variableSetToCss({
      set: this.data,
      getModifierDefinition: (name) => modifiers[name],
      stringifyData: (type, data) => `${data}`,
    });
    if (error) {
      console.error(error);
      return {};
    } else {
      return css;
    }
  }
  get css$() {
    return combineLatest([
      this.data$,
      this.sheet.styleManager.modifiersByName$,
    ]).pipe(
      map(([data, modifiers]) => {
        const [css, error] = variableSetToCss({
          set: data,
          getModifierDefinition: (name) => modifiers[name],
          stringifyData: (type, data) => `${data}`,
        });
        if (error) {
          console.error(error);
          return {};
        } else {
          return css;
        }
      }),
    );
  }

  constructor({ sheet, id }: { sheet: IStyleVariableSheet; id?: string }) {
    super();
    this.id = id || genId();
    this.sheet = sheet;
    this.styleSheet = new StyleVariableSetStylesheet({ variableSet: this });
  }

  setName(name: string) {
    this._name$.next(name);
  }
  setDatatype(datatype: string) {
    this._datatype$.next(datatype);
  }
  setModes(modes: ElllSelectorData[]) {
    this._modes$.next(modes);
  }
  setVariables(variables: StyleVariableData[]) {
    this._variables$.next(variables);
  }

  restore(data: StyleVariableSetData): void {
    this._name$.next(data.name);
    this._datatype$.next(data.datatype);
    this._modes$.next(data.modes ?? []);
    this._variables$.next(data.variables ?? []);
  }
}
