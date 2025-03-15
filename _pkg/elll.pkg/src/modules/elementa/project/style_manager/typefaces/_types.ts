import { TypefaceData } from "@elllphnt/elll-element";
import { Observable } from "rxjs";

export interface ITypefaceSheet {
  typefaces: TypefaceData[];
  typefaces$: Observable<TypefaceData[]>;
}
