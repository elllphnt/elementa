import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";

export interface FragmentElement extends BaseElement<"fragment"> {
  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  setFragmentId(id: string | undefined): void;
}
