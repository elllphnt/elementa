import { ensureField, getOrCreateYArray } from "@elllphnt/crdt";
import {
  CssStyleSheet,
  Element,
  ElementEnvironment,
  Fragment,
} from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelList,
  combineLatestArrays,
  combineLatestOrEmpty,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable, switchMap } from "rxjs";
import * as y from "yjs";
import { CrdtDataInput } from "../_shared/data_input.js";
import { CrdtIdentifiable } from "../_shared/identifiable.js";
import { CrdtcreateElement, CrdtElement } from "../elements/_element.js";

export class CrdtFragment extends CrdtIdentifiable implements Fragment {
  environment: ElementEnvironment;

  private _state: CrdtRecordState<Omit<Fragment, "id" | "content" | "params">>;
  private _content: AggregatedCrdtModelList<CrdtElement>;
  private _params: AggregatedCrdtModelList<CrdtDataInput>;

  // properties

  get name(): string | undefined {
    return this._state.entry("name");
  }
  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  get content(): Element[] {
    return this._content.models;
  }
  get content$(): Observable<Element[]> {
    return this._content.models$;
  }

  get params(): CrdtDataInput[] {
    return this._params.models;
  }
  get params$(): Observable<CrdtDataInput[]> {
    return this._params.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [...this.content.flatMap((c) => c.allCssStylesheets)];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]);
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
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, key: keyManager.next("fragment"), initialized });

    this.environment = environment;

    if (!initialized) {
      ensureField(crdt, "content", () => new y.Array());
      ensureField(crdt, "params", () => new y.Array());
    }

    this._state = new CrdtRecordState<
      Omit<Fragment, "id" | "content" | "params">
    >(crdt);
    this._content = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "content"),
      create: (crdt, init) =>
        CrdtcreateElement({
          crdt,
          environment: this.environment,
          initialized: init && initialized,
        }),
    });

    this._params = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "params"),
      create: (crdt, init) =>
        new CrdtDataInput({ crdt, initialized: init && initialized }),
    });

    this.addDisposer(() => {
      this._content.dispose();
      this._params.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtFragment({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
