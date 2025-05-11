import { Observable } from "rxjs";
import { Fragment } from "./fragment.js";

export interface Template extends Fragment {
  name: string;
  name$: Observable<string>;
}
