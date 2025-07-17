import type { ElementData, FragmentData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, map, switchMap } from "rxjs";
import type { Element } from "../elements/_element.js";
import { createElement } from "../elements/_element.js";
import type { ElementEnvironment } from "../elements/_environment.js";
import { Identifiable } from "../identifiable.js";

export class Fragment extends Identifiable<FragmentData> {
  environment: ElementEnvironment;

  private _content: AggregatedModelList<RecordState<ElementData>, Element>;

  // properties

  get name(): string | undefined {
    return this.state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this.state.entry$("name");
  }

  get content() {
    return this._content.models;
  }
  get content$() {
    return this._content.models$;
  }

  get allCssStylesheets() {
    return [...this.content.flatMap((c) => c.allCssStylesheets || [])];
  }
  get allCssStylesheets$() {
    return combineLatest([
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$ || []))
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

    this.environment = environment;

    this._content = new AggregatedModelList<RecordState<ElementData>, Element>({
      state: state.getListOfRecordStates("content"),
      create: (state) => {
        return createElement({ state, environment, initialized: true });
      },
    });

    this.addLifecycle(this._content);
  }
}
