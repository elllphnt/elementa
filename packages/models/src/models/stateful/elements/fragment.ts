import { FragmentElementData } from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Fragment,
  FragmentElement,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import { StatefulBaseElement } from "./_base.js";

export class StatefulFragmentElement
  extends StatefulBaseElement<FragmentElementData>
  implements FragmentElement
{
  // getters
  get fragmentId(): string | undefined {
    return this._state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this._state.entry$("fragmentId");
  }

  get fragment() {
    const fragmentId = this.fragmentId;
    return fragmentId ? this.environment.fragment(fragmentId) : undefined;
  }
  get fragment$(): Observable<Fragment | undefined> {
    return this.fragmentId$.pipe(
      switchMap((id) => (id ? this.environment.fragment$(id) : of(undefined)))
    );
  }

  paramValue(varName: string) {
    return this._state.entry("params")?.[varName];
  }
  paramValue$(varName: string): Observable<any> {
    return this._state
      .entry$("params")
      .pipe(map((params) => params?.[varName]));
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  // data getters
  get data(): FragmentElementData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<FragmentElementData> {
    return combineLatestMerged([super._data$]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: FragmentElementData;
    environment: RenderingEnvironment;
  }) {
    super({ init, environment });
  }

  setFragmentId(id: string | undefined): void {
    this._state.set("fragmentId", id);
  }

  setParamValue(varName: string, value: any): void {
    this._state.set("params", {
      ...this._state.entry("params"),
      [varName]: value,
    });
  }
  clearParamValue(varName: string): void {
    const params = { ...this._state.entry("params") };
    delete params[varName];
    this._state.set("params", params);
  }
}
