import { Observable, of } from "rxjs";
import { FragmentEnvironment } from "../environment/_.js";
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
    environment: FragmentEnvironment;
    params?: { [key: string]: unknown };
  }) {
    super({ environment });
    this._params = params || {};
  }
}
