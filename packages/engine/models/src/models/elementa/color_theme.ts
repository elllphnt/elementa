import type { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";

export class ColorTheme extends Model<RecordState<ColorThemeData>> {
  get scheme(): string | undefined {
    return this.state.entry("scheme");
  }

  get scheme$(): Observable<string | undefined> {
    return this.state.entry$("scheme");
  }

  get foreground(): ColorData | undefined {
    return this.state.entry("foreground");
  }

  get foreground$(): Observable<ColorData | undefined> {
    return this.state.entry$("foreground");
  }

  get background(): ColorData | undefined {
    return this.state.entry("background");
  }

  get background$(): Observable<ColorData | undefined> {
    return this.state.entry$("background");
  }

  constructor({ state }: { state: RecordState<ColorThemeData> }) {
    super({ state });

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  setScheme(scheme: string | undefined): void {
    this.state.set("scheme", scheme);
  }

  setForeground(foreground: ColorData | undefined): void {
    this.state.set("foreground", foreground);
  }

  setBackground(background: ColorData | undefined): void {
    this.state.set("background", background);
  }
}
