import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import { Expression } from "@elllphnt/elementa-base";
import {
  PrimitiveSubElement,
  RenderingEnvironment,
  StylesheetCssStyleSheet,
} from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtStylesheet } from "../../style/stylesheet/stylesheet.js";

export class CrdtPrimitiveSubElement
  extends CrdtModel<y.Map<any>>
  implements PrimitiveSubElement
{
  readonly environment: RenderingEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  private _stylesheet: CrdtStylesheet;
  private _state: CrdtRecordState<{
    interactions?: Record<string, Expression>;
  }>;

  get interactions(): Record<string, Expression> | undefined {
    return this._state.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._state.entry$("interactions");
  }

  constructor({
    crdt,
    environment,
    cssStyleSheetTarget,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    cssStyleSheetTarget?: string;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("primitive-sub-element"), crdt });

    this.environment = environment;

    if (!initialized) {
      ensureField(crdt, "stylesheet", () => new y.Map());
    }

    const stylesheetMap = getOrCreateYMap(crdt, "stylesheet");
    this._stylesheet = new CrdtStylesheet({
      crdt: stylesheetMap,
      project: environment.project,
      initialized,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget ?? this.key,
      stylesheet: this._stylesheet,
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
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
    this._state.set("interactions", interactions);
  }

  clearInteraction(event: string): void {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this._state.set("interactions", interactions);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtPrimitiveSubElement({
      crdt,
      environment: this.environment,
      cssStyleSheetTarget: this.cssStyleSheet.target,
      initialized: true,
    }) as this;
  }
}
