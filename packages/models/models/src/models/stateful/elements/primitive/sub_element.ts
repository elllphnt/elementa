import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import {
  ElementEnvironment,
  PrimitiveSubElement,
  StylesheetCssStyleSheet,
} from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  keyManager,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import { StatefulStylesheet } from "../../style/stylesheet/stylesheet.js";

export class StatefulPrimitiveSubElement
  extends Model<PrimitiveSubElementData>
  implements PrimitiveSubElement
{
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  // private properties
  private _stylesheet: StatefulStylesheet;
  private _state: RecordState<Omit<PrimitiveSubElementData, "stylesheet">>;

  get interactions(): Record<string, Expression> | undefined {
    return this._state.entry("interactions");
  }
  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._state.entry$("interactions");
  }

  // data getters
  get data(): PrimitiveSubElementData {
    return {
      ...this._state.record,
      stylesheet: this._stylesheet.data,
    };
  }
  get data$(): Observable<PrimitiveSubElementData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        stylesheet: this._stylesheet.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
    cssStyleSheetTarget,
  }: {
    init: PrimitiveSubElementData;
    environment: ElementEnvironment;
    cssStyleSheetTarget?: string;
  }) {
    super({ key: keyManager.next("primitive-sub-element") });

    this.environment = environment;

    const { stylesheet, ...stateData } = init;

    this._stylesheet = new StatefulStylesheet({
      init: stylesheet ?? {},
      project: environment.project,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget ?? this.key,
      stylesheet: this._stylesheet,
    });

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  // methods
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
    this._state.set("interactions", interactions);
  }
  clearInteraction(event: string): void {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this._state.set("interactions", interactions);
  }

  // restore method
  restore(data: PrimitiveSubElementData): void {
    const { stylesheet, ...stateData } = data;

    this._state.setRecord(stateData);
    this._stylesheet.restore(stylesheet ?? {});
  }
}
