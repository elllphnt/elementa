import { Observable } from "rxjs";
import { Model } from "../model.js";

export interface DataInput extends Model {
  name: string;
  name$: Observable<string>;

  varName: string | undefined;
  varName$: Observable<string | undefined>;

  tsType: string | undefined;
  tsType$: Observable<string | undefined>;

  required: boolean | undefined;
  required$: Observable<boolean | undefined>;

  defaultValue: any;
  defaultValue$: Observable<any>;
}
