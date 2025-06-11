import { FragmentElementData } from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Fragment,
  FragmentElement,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { Observable, of, switchMap } from "rxjs";
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

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "fragment", environment, initialized });
  }

  setFragmentId(id: string | undefined): void {
    this._state.set("fragmentId", id);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtFragmentElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
