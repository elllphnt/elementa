import { Observable } from "rxjs";
import { Fragment } from "../../../fragment.js";

export interface FragmentRenderableContent {
  type: "fragment";

  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: Fragment | undefined;
  fragment$: Observable<Fragment | undefined>;

  params: Record<string, any>;
  params$: Observable<Record<string, any>>;

  paramValue(name: string): any | undefined;
  paramValue$(name: string): Observable<any | undefined>;
}
