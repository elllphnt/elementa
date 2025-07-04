import type { Observable} from "rxjs";
import { of } from "rxjs";
import { FragmentInputResolver } from "./input_resolver.js";
import type { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";

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
