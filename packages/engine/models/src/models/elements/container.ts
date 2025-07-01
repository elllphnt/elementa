import { ContainerElementData } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { combineLatest, map, Observable, of, switchMap, tap } from "rxjs";
import { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { modelsLogger } from "../../loggers.js";
import { BaseElement } from "./_base.js";
import { createElement, Element } from "./_element.js";
import { ElementEnvironment } from "./_environment.js";

export class ContainerElement extends BaseElement<ContainerElementData> {
  private _content: AggregatedModelList<RecordState<any>, Element>;

  get content(): Element[] {
    return this._content.models;
  }
  get content$(): Observable<Element[]> {
    return this._content.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...this.content.flatMap((c) => c.allCssStylesheets),
    ];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatest([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(
            c.map((c) =>
              c.allCssStylesheets$.pipe(
                tap((styleshets) => {
                  modelsLogger.debug(
                    `ContainerElement content allCssStylesheets$ - ${this.id}`,
                    {
                      element: this,
                      content: c,
                      styleshets,
                    }
                  );
                })
              )
            )
          ).pipe(
            tap((styleshets) => {
              modelsLogger.debug(
                `ContainerElement all allCssStylesheets$ - ${this.id}`,
                {
                  element: this,
                  styleshets,
                }
              );
            })
          )
        ),
        map((c) => c.flat())
      ),
    ]).pipe(
      tap((styleshets) => {
        modelsLogger.debug(`ContainerElement allCssStylesheets$ - ${this.id}`, {
          element: this,
          styleshets,
        });
      }),
      map(([main, content]) => [...main, ...content])
    );
  }

  get slotIds(): string[] {
    return this.content.flatMap((c) => c.slotIds);
  }

  get slotIds$(): Observable<string[]> {
    return this.content$.pipe(
      switchMap((c) => combineLatestOrEmpty(c.map((c) => c.slotIds$))),
      map((slotIdsArrays) => slotIdsArrays.flat())
    );
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<ContainerElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "container", environment, initialized });

    modelsLogger.info("Creating container element", {
      elementId: this.id,
      elementType: this.type,
      projectId: environment.project.id,
      initialized: initialized ?? false,
    });

    this._content = new AggregatedModelList<RecordState<any>, Element>({
      state: state.getListOfRecordStates("content"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
          initialized: true,
        }),
    });

    this.addInitializer(() => {
      modelsLogger.debug("Initializing container element content", {
        elementId: this.id,
        contentCount: this._content.models.length,
        slotIdsCount: this.slotIds.length,
        stylesheetsCount: this.allCssStylesheets.length,
      });
      this._content.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing container element content", {
          elementId: this.id,
          contentCount: this._content.models.length,
        });
        this._content.dispose();
      });
    });
  }
}
