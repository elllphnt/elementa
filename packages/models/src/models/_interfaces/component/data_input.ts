import { Observable } from "rxjs";

export interface DataInput {
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
