import { ColorData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface ColorTheme {
  scheme: string;
  scheme$: Observable<string>;

  foreground: ColorData;
  foreground$: Observable<ColorData>;

  background: ColorData;
  background$: Observable<ColorData>;
}
