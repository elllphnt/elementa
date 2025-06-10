import { FragmentElementData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable, of, switchMap } from "rxjs";
import {
  ElementEnvironment,
  Fragment,
  FragmentElement,
} from "~/models/component/_.js";
import { CssStyleSheet } from "../../../../css/_.js";
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
    environment: ElementEnvironment;
  }) {
    super({ init, environment });
  }

  setFragmentId(id: string | undefined): void {
    this._state.set("fragmentId", id);
  }
}
