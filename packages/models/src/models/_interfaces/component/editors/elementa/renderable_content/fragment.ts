import { Observable } from "rxjs";
import { Fragment } from "../../../fragment.js";
import { BaseRenderableContent } from "./_base.js";

export interface FragmentRenderableContent
  extends BaseRenderableContent<"fragment"> {
  fragmentUrl: string | undefined;
  fragmentUrl$: Observable<string | undefined>;

  fragment: Fragment | undefined;
  fragment$: Observable<Fragment | undefined>;

  params: Record<string, any> | undefined;
  params$: Observable<Record<string, any> | undefined>;

  paramValue(name: string): any | undefined;
  paramValue$(name: string): Observable<any | undefined>;
}
