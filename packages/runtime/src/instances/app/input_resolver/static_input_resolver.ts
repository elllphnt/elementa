import { Observable, of } from "rxjs";
import { FragmentEnvironment } from "../../fragment/_.js";
import { AppInputResolver } from "./input_resolver.js";

export class StaticAppInputResolver extends AppInputResolver {
  private _variables: { [key: string]: unknown };

  variableValue(name: string): unknown {
    return this._variables[name];
  }

  variableValue$(name: string): Observable<unknown> {
    return of(this._variables[name]);
  }

  constructor({
    environment,
    variables,
  }: {
    environment: FragmentEnvironment;
    variables?: { [key: string]: unknown };
  }) {
    super({ environment });
    this._variables = variables || {};
  }
}
