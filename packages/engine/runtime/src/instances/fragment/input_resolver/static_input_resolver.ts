import { Observable, of } from "rxjs";
import { ElementRuntimeEnvironment } from "../../elements/_environment/_.js";
import { FragmentInputResolver } from "./input_resolver.js";

export class StaticFragmentInputResolver extends FragmentInputResolver {
  private _params: { [key: string]: unknown };

  paramValue(name: string): unknown {
    return this._params[name];
  }

  paramValue$(name: string): Observable<unknown> {
    return of(this._params[name]);
  }

  constructor({
    environment,
    params,
  }: {
    environment: ElementRuntimeEnvironment;
    params?: { [key: string]: unknown };
  }) {
    super({ environment });
    this._params = params || {};
  }
}
