import {
  DataInputData,
  ElementData,
  FragmentData,
} from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { combineLatest, map, Observable, switchMap, tap } from "rxjs";
import { modelsLogger } from "../../loggers.js";
import { createElement, Element } from "../elements/_element.js";
import { ElementEnvironment } from "../elements/_environment.js";
import { Identifiable } from "../identifiable.js";
import { DataInput } from "../primitives/data_input.js";

export class Fragment extends Identifiable<FragmentData> {
  environment: ElementEnvironment;

  private _content: AggregatedModelList<RecordState<ElementData>, Element>;
  private _params: AggregatedModelList<RecordState<DataInputData>, DataInput>;

  // properties

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get varName(): string | undefined {
    return this.state.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this.state.entry$("varName");
  }

  get content() {
    return this._content.models;
  }
  get content$() {
    return this._content.models$;
  }

  get params() {
    return this._params.models;
  }
  get params$() {
    return this._params.models$;
  }

  get allCssStylesheets() {
    return [...this.content.flatMap((c) => c.allCssStylesheets || [])];
  }

  get allCssStylesheets$() {
    return combineLatest([
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(
            c.map(
              (c) =>
                c.allCssStylesheets$.pipe(
                  tap((styleshets) => {
                    modelsLogger.debug("Fragment allCssStylesheets$", {
                      fragmentId: this.id,
                      stylesheetsCount: styleshets.length,
                      elementId: c.id,
                    });
                  })
                ) || []
            )
          )
        ),
        map((c) => c.flat())
      ),
    ]).pipe(map(([contentStyles]) => [...contentStyles]));
  }

  get slotIds(): string[] {
    return this.content.flatMap((c) => c.slotIds || []);
  }

  get slotIds$(): Observable<string[]> {
    return this.content$.pipe(
      switchMap((c) => combineLatestOrEmpty(c.map((c) => c.slotIds$ || []))),
      map((slotIdsArrays) => slotIdsArrays.flat())
    );
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<FragmentData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, project: environment.project, initialized });

    modelsLogger.info("Creating fragment", {
      fragmentId: this.id,
      projectId: environment.project.id,
      initialized: initialized ?? false,
      hasName: !!this.name,
      varName: this.varName,
    });

    this.environment = environment;

    this._content = new AggregatedModelList<RecordState<ElementData>, Element>({
      state: state.getListOfRecordStates("content"),
      create: (state) => {
        return createElement({ state, environment, initialized: true });
      },
    });
    this._params = new AggregatedModelList<
      RecordState<DataInputData>,
      DataInput
    >({
      state: state.getListOfRecordStates("params"),
      create: (state) => {
        return new DataInput({ state });
      },
    });

    this.addInitializer(() => {
      modelsLogger.debug("Initializing fragment models", {
        fragmentId: this.id,
        fragmentName: this.name,
        contentCount: this._content.models.length,
        paramsCount: this._params.models.length,
        slotIdsCount: this.slotIds.length,
      });

      this._content.initialize();
      this._params.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing fragment models", {
          fragmentId: this.id,
          fragmentName: this.name,
          contentCount: this._content.models.length,
          paramsCount: this._params.models.length,
        });
        this._content.dispose();
        this._params.dispose();
      });
    });
  }
}
