import { View } from "@repo/shell";
import { Observable } from "rxjs";

export type SheetProps<D> = D & {
  stateKey: string[];
};

export type SheetData<P extends {}> = {
  key: string;
  viewId: string;
  title?: string | ((props: P) => string);
  noIndent?: boolean;
};

export type SheetView<P extends {} = {}> = View & {
  title?: string;
  order?: number;
  enabled?: (props: P) => boolean;
  enabled$?: (props: P) => Observable<boolean>;
  scopes?: string[];
};
