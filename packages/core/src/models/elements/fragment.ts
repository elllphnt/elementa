import { Observable } from "rxjs";
import { Fragment } from "../fragment/_.js";
import { BaseElement } from "./_base.js";

export interface FragmentElement extends BaseElement<"fragment"> {
  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: Fragment | undefined;
  fragment$: Observable<Fragment | undefined>;

  setFragmentId(id: string | undefined): void;
}
