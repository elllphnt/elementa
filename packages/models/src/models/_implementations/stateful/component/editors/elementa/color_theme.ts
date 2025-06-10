import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { ColorTheme } from "../../../../../_.js";

export class StatefulColorTheme
  extends Model<ColorThemeData>
  implements ColorTheme
{
  private _state: RecordState<Partial<ColorThemeData>>;

  get scheme(): string | undefined {
    return this._state.record.scheme;
  }

  get scheme$(): Observable<string | undefined> {
    return this._state.entry$("scheme");
  }

  get foreground(): ColorData | undefined {
    return this._state.entry("foreground");
  }

  get foreground$(): Observable<ColorData | undefined> {
    return this._state.entry$("foreground");
  }

  get background(): ColorData | undefined {
    return this._state.entry("background");
  }

  get background$(): Observable<ColorData | undefined> {
    return this._state.entry$("background");
  }

  get data(): ColorThemeData {
    return this._state.record;
  }

  get data$(): Observable<ColorThemeData> {
    return this._state.record$;
  }

  constructor({ init }: { init: ColorThemeData }) {
    super();

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: ColorThemeData) {
    this._state.setRecord(data);
  }
}
