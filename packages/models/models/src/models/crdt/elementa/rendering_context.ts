import {
  ensureField,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/crdt";
import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { RenderingContext } from "@elllphnt/elementa-core";
import {
  CrdtListState,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtColorTheme } from "./color_theme.js";
import { CrdtViewport } from "./viewport.js";

export class CrdtRenderingContext
  extends CrdtModel<y.Map<any>>
  implements RenderingContext
{
  readonly theme: CrdtColorTheme;
  readonly viewport: CrdtViewport;

  private _state: CrdtRecordState<
    Omit<RenderingContextData, "theme" | "viewport" | "styleModifiers">
  >;
  private _styleModifiers: CrdtListState<StyleModifierData>;

  get customStyleModifiers(): StyleModifierData[] {
    return this._styleModifiers.items;
  }
  get customStyleModifiers$(): Observable<StyleModifierData[]> {
    return this._styleModifiers.items$;
  }

  get viewportEnabled(): boolean | undefined {
    return this._state.entry("viewportEnabled");
  }
  get viewportEnabled$(): Observable<boolean | undefined> {
    return this._state.entry$("viewportEnabled");
  }

  get styleModifierEnabled(): boolean | undefined {
    return this._state.entry("styleModifierEnabled");
  }
  get styleModifierEnabled$(): Observable<boolean | undefined> {
    return this._state.entry$("styleModifierEnabled");
  }

  get styleModifiers(): StyleModifierData[] {
    return [...this.customStyleModifiers];
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.customStyleModifiers$;
  }

  constructor({
    crdt,
    initialized,
  }: {
    crdt: y.Map<any>;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("rendering-context"), crdt });

    if (!initialized) {
      ensureField(crdt, "theme", () => new y.Map());
      ensureField(crdt, "viewport", () => new y.Map());
      ensureField(crdt, "__crdtAtomic", () => ["styleModifiers[*]"]);
    }

    const themeMap = getOrCreateYMap(crdt, "theme");
    this.theme = new CrdtColorTheme({
      crdt: themeMap,
      initialized,
    });

    const viewportMap = getOrCreateYMap(crdt, "viewport");
    this.viewport = new CrdtViewport({
      crdt: viewportMap,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);
    this._styleModifiers = new CrdtListState(
      getOrCreateYArray(crdt, "styleModifiers")
    );

    this.addDisposer(() => {
      this._state.dispose();
      this.theme.dispose();
      this.viewport.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtRenderingContext({
      crdt,
      initialized: true,
    }) as this;
  }
}
