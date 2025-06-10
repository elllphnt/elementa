import {
  RenderingContextData,
  StyleModifierData,
} from "@elllphnt/elementa-base";
import {
  ListState,
  Model,
  RecordState,
  combineLatestArrays,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest } from "rxjs";
import { RenderingContext } from "../../../../../_.js";
import { ColorThemeModel } from "./color_theme.js";
import { ViewportModel } from "./viewport.js";

export class RenderingContextModel
  extends Model<RenderingContextData>
  implements RenderingContext
{
  readonly theme: ColorThemeModel;
  readonly viewport: ViewportModel;

  private _state: RecordState<
    Omit<RenderingContextData, "theme" | "viewport" | "styleModifiers">
  >;
  private _customStyleModifiers: ListState<StyleModifierData>;

  get customStyleModifiers(): StyleModifierData[] {
    return this._customStyleModifiers.items;
  }
  get customStyleModifiers$(): Observable<StyleModifierData[]> {
    return this._customStyleModifiers.items$;
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
    return combineLatestArrays([this.customStyleModifiers$]);
  }

  get data(): RenderingContextData {
    return {
      ...this._state.record,
      theme: this.theme.data,
      viewport: this.viewport.data,
      styleModifiers: this.customStyleModifiers,
    };
  }

  get data$(): Observable<RenderingContextData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        theme: this.theme.data$,
        viewport: this.viewport.data$,
        styleModifiers: this.customStyleModifiers$,
      }),
    ]);
  }

  constructor({ init }: { init: RenderingContextData }) {
    const { theme, viewport, styleModifiers, ...stateData } = init;
    super({ key: keyManager.next("rendering-context") });

    this.theme = new ColorThemeModel({ init: theme ?? {} });
    this.viewport = new ViewportModel({ init: viewport ?? {} });

    this._state = new RecordState({
      init: stateData,
    });

    this._customStyleModifiers = new ListState({
      init: styleModifiers || [],
    });

    this.addDisposer(() => {
      this._state.dispose();
      this.theme.dispose();
      this.viewport.dispose();
      this._customStyleModifiers.dispose();
    });
  }

  restore(data: RenderingContextData) {
    const { theme, viewport, styleModifiers, ...stateData } = data;

    this._state.setRecord(stateData);
    this.theme.restore(theme ?? {});
    this.viewport.restore(viewport ?? {});
    this._customStyleModifiers.setItems(styleModifiers || []);
  }
}
