import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import { ListState, Model, RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { ColorTheme } from "./color_theme.js";
import { Viewport } from "./viewport.js";

export class RenderingContext extends Model<RecordState<RenderingContextData>> {
  readonly theme: ColorTheme;
  readonly viewport: Viewport;

  private _styleModifiers: ListState<StyleModifierData>;

  get customStyleModifiers(): StyleModifierData[] {
    return this._styleModifiers.items;
  }
  get customStyleModifiers$(): Observable<StyleModifierData[]> {
    return this._styleModifiers.items$;
  }

  get viewportEnabled(): boolean | undefined {
    return this.state.entry("viewportEnabled");
  }
  get viewportEnabled$(): Observable<boolean | undefined> {
    return this.state.entry$("viewportEnabled");
  }

  get styleModifierEnabled(): boolean | undefined {
    return this.state.entry("styleModifierEnabled");
  }
  get styleModifierEnabled$(): Observable<boolean | undefined> {
    return this.state.entry$("styleModifierEnabled");
  }

  get styleModifiers(): StyleModifierData[] {
    return [...this.customStyleModifiers];
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.customStyleModifiers$;
  }

  constructor({ state }: { state: RecordState<RenderingContextData> }) {
    super({ state });

    this.theme = new ColorTheme({
      state: state.getRecordState("theme"),
    });

    this.viewport = new Viewport({
      state: state.getRecordState("viewport"),
    });

    this._styleModifiers = state.getListState("styleModifiers");

    this.addDisposer(() => {
      this.theme.dispose();
      this.viewport.dispose();
    });
  }
}
