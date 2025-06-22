import { Observable } from "rxjs";
import { Fragment } from "../fragment/_.js";
import { BaseElement } from "./_base.js";

export interface FragmentElement extends BaseElement<"fragment"> {
  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: Fragment | undefined;
  fragment$: Observable<Fragment | undefined>;

  params: Record<string, any>;
  params$: Observable<Record<string, any>>;

  paramValue(varName: string): any;
  paramValue$(varName: string): Observable<any>;

  setFragmentId(id: string | undefined): void;
  setParamValue(varName: string, value: any): void;
  clearParamValue(varName: string): void;
}
