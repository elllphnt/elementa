import type {
  Expression,
  PrimitiveSubElementData,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import { StyleClassCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { StyleClass } from "~/models/style/stylesheet/styleclass.js";
import type { ElementEnvironment } from "../_environment.js";

export class PrimitiveSubElement extends Model<
  RecordState<PrimitiveSubElementData>
> {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StyleClassCssStyleSheet;

  private _styleClass: StyleClass;

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

    this._styleClass = new StyleClass({
      state: state.getRecordState("styleClass"),
      project: environment.project,
      initialized,
    });

    this.cssStyleSheet = new StyleClassCssStyleSheet({
      target: cssStyleSheetTarget ?? "TODO", // TODO: Generate proper key
      styleClass: this._styleClass,
    });

    this.addInitializer(() => {
      this._styleClass.initialize();
      this.cssStyleSheet.initialize();

      this.addDisposer(() => {
        this._styleClass.dispose();
        this.cssStyleSheet.dispose();
      });
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
