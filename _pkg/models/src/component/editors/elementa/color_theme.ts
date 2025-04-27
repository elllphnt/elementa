import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";

export class ColorTheme extends MapCRDTModel<ColorThemeData> {
  get scheme() {
    return this.state.scheme;
  }
  get scheme$() {
    return this.state$.pipe(map((data) => data.scheme));
  }

  get foreground() {
    return this.state.foreground;
  }
  get foreground$() {
    return this.state$.pipe(map((data) => data.foreground));
  }

  get background() {
    return this.state.background;
  }
  get background$() {
    return this.state$.pipe(map((data) => data.background));
  }

  constructor(ymap: y.Map<any>) {
    super(ymap);
  }

  setScheme(scheme: string) {
    this.patch({
      scheme,
    });
  }
  setForeground(foreground: ColorData) {
    this.patch({
      foreground,
    });
  }
  setBackground(background: ColorData) {
    this.patch({
      background,
    });
  }
}
