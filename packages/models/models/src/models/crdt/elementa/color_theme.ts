import { ensureField } from "@elllphnt/crdt";
import { ColorData, ColorThemeData } from "@elllphnt/elementa-base";
import { ColorTheme } from "@elllphnt/elementa-core";
import { CrdtModel, CrdtRecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export class CrdtColorTheme
  extends CrdtModel<y.Map<any>>
  implements ColorTheme
{
  private _state: CrdtRecordState<ColorThemeData>;

  get scheme(): string | undefined {
    return this._state.entry("scheme");
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

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ crdt });

    if (!initialized) {
      ensureField(crdt, "__crdtAtomic", () => ["foreground", "background"]);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtColorTheme({
      crdt,
      initialized: true,
    }) as this;
  }
}
