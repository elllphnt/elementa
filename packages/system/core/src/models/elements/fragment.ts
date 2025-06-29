import { FragmentElementData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import { CssStyleSheet } from "~/css/_.js";
import { Fragment } from "../fragment/_.js";
import { BaseElement } from "./_base.js";
import { ElementEnvironment } from "./_environment.js";

export class FragmentElement extends BaseElement<FragmentElementData> {
  get fragmentId(): string | undefined {
    return this.state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this.state.entry$("fragmentId");
  }

  get fragment(): Fragment | undefined {
    const fragmentId = this.fragmentId;
    return fragmentId ? this.environment.fragment(fragmentId) : undefined;
  }

  get fragment$(): Observable<Fragment | undefined> {
    return this.fragmentId$.pipe(
      switchMap((id) => (id ? this.environment.fragment$(id) : of(undefined)))
    );
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  get params(): Record<string, any> {
    return this.state.entry("params") || {};
  }
  get params$(): Observable<Record<string, any>> {
    return this.state.entry$("params").pipe(map((params) => params || {}));
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<FragmentElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, type: "fragment", environment, initialized });
  }

  setFragmentId(id: string | undefined): void {
    this.state.set("fragmentId", id);
  }

  paramValue(varName: string): any {
    return this.params[varName];
  }

  paramValue$(varName: string): Observable<any> {
    return this.params$.pipe(map((params) => params?.[varName]));
  }

  setParamValue(varName: string, value: any): void {
    this.state.set("params", {
      ...this.state.entry("params"),
      [varName]: value,
    });
  }

  clearParamValue(varName: string): void {
    const params = { ...this.state.entry("params") };
    delete params[varName];
    this.state.set("params", params);
  }
}
