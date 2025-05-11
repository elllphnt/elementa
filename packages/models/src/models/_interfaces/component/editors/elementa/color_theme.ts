import { ColorData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface ColorTheme {
  scheme: string | undefined;
  scheme$: Observable<string | undefined>;

  foreground: ColorData | undefined;
  foreground$: Observable<ColorData | undefined>;

  background: ColorData | undefined;
  background$: Observable<ColorData | undefined>;
}
