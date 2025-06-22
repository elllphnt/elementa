import { FragmentElementData } from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  ElementEnvironment,
  Fragment,
  FragmentElement,
} from "@elllphnt/elementa-core";
import { map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";

export class CrdtFragmentElement
  extends CrdtBaseElement<FragmentElementData>
  implements FragmentElement
{
  get fragmentId(): string | undefined {
    return this._state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this._state.entry$("fragmentId");
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
    return this._state.entry("params") || {};
  }
  get params$(): Observable<Record<string, any>> {
    return this._state.entry$("params").pipe(map((params) => params || {}));
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
    super({ crdt, type: "fragment", environment, initialized });
  }

  setFragmentId(id: string | undefined): void {
    this._state.set("fragmentId", id);
  }

  paramValue(varName: string): any {
    return this.params[varName];
  }

  paramValue$(varName: string): Observable<any> {
    return this.params$.pipe(map((params) => params?.[varName]));
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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtFragmentElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
