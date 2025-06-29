import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { StylesheetCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { Stylesheet } from "../../style/stylesheet/stylesheet.js";
import { ElementEnvironment } from "../_environment.js";

export class PrimitiveSubElement extends Model<
  RecordState<PrimitiveSubElementData>
> {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  private _stylesheet: Stylesheet;

  get interactions(): Record<string, Expression> | undefined {
    return this.state.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this.state.entry$("interactions");
  }

  constructor({
    state,
    environment,
    cssStyleSheetTarget,
    initialized,
  }: {
    state: RecordState<PrimitiveSubElementData>;
    environment: ElementEnvironment;
    cssStyleSheetTarget?: string;
    initialized?: boolean;
  }) {
    super({ state });

    this.environment = environment;

    this._stylesheet = new Stylesheet({
      state: state.getRecordState("stylesheet"),
      project: environment.project,
      initialized,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget ?? "TODO", // TODO: Generate proper key
      stylesheet: this._stylesheet,
    });

    this.addDisposer(() => {
      this._stylesheet.dispose();
    });
  }

  interaction(event: string): Expression | undefined {
    return this.interactions?.[event];
  }

  interaction$(event: string): Observable<Expression | undefined> {
    return this.interactions$.pipe(
      map((interactions) => interactions?.[event])
    );
  }

  setInteraction(event: string, interaction: Expression): void {
    const interactions = { ...this.interactions };
    interactions[event] = interaction;
    this.state.set("interactions", interactions);
  }

  clearInteraction(event: string): void {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this.state.set("interactions", interactions);
  }
}
