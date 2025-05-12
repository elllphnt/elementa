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
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin } from "rxjs";
import { RenderingContext } from "../../../../_interfaces/_.js";
import { ColorThemeModel } from "./color_theme.js";
import { ViewportModel } from "./viewport.js";

export class RenderingContextModel
  extends Model<RenderingContextData>
  implements RenderingContext
{
  readonly theme: ColorThemeModel;
  readonly viewport: ViewportModel;

  private _state: RecordState<
    Omit<RenderingContextData, "theme" | "viewport" | "customStyleModifiers">
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
      forkJoin({
        theme: this.theme.data$,
        viewport: this.viewport.data$,
        styleModifiers: this.customStyleModifiers$,
      }),
    ]);
  }

  constructor({ init }: { init: RenderingContextData }) {
    super();

    this.theme = new ColorThemeModel({ init: init.theme ?? {} });
    this.viewport = new ViewportModel({ init: init.viewport ?? {} });

    this._state = new RecordState({
      init: {
        ...init,
        theme: undefined,
        viewport: undefined,
        customStyleModifiers: undefined,
      },
    });

    this._customStyleModifiers = new ListState({
      init: init.styleModifiers || [],
    });

    this.addDisposer(() => {
      this._state.dispose();
      this.theme.dispose();
      this.viewport.dispose();
      this._customStyleModifiers.dispose();
    });
  }

  restore(data: RenderingContextData) {
    this._state.setRecord(data);
    this.theme.restore(data.theme ?? {});
    this.viewport.restore(data.viewport ?? {});
    this._customStyleModifiers.setItems(data.styleModifiers || []);
  }
}
