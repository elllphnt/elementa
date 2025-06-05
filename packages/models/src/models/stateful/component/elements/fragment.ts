import { FragmentElementData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Project } from "../../../../infrastructure/_.js";
import { FragmentElement } from "../../../_interfaces/_.js";
import { BaseElementModel } from "./_base.js";

export class FragmentElementModel
  extends BaseElementModel<FragmentElementData>
  implements FragmentElement
{
  // getters
  get fragmentId(): string | undefined {
    return this._state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this._state.entry$("fragmentId");
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
    project,
  }: {
    init: FragmentElementData;
    project: Project;
  }) {
    super({ init, project });
  }
  setFragmentId(id: string | undefined): void {
    this._state.set("fragmentId", id);
  }

  restore(data: FragmentElementData): void {
    super.restore(data);
  }
}
