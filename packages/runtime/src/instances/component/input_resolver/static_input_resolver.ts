import { SlotFill } from "@elllphnt/elementa-core";
import { Observable, of } from "rxjs";
import { FragmentEnvironment } from "../../fragment/_.js";
import { ComponentInputResolver } from "./input_resolver.js";

export class StaticComponentInputResolver extends ComponentInputResolver {
  private _props: { [key: string]: unknown };
  private _slotFills: { [key: string]: SlotFill | undefined };

  propValue(varName: string): unknown {
    return this._props[varName];
  }
  propValue$(varName: string): Observable<unknown> {
    return of(this._props[varName]);
  }
  slotFill(id: string): SlotFill | undefined {
    return this._slotFills[id];
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return of(this._slotFills[id]);
  }

  constructor({
    environment,
    props,
    slotFills,
  }: {
    environment: FragmentEnvironment;
    props?: { [key: string]: unknown };
    slotFills?: { [key: string]: SlotFill | undefined };
  }) {
    super({ environment });
    this._props = props || {};
    this._slotFills = slotFills || {};
  }
}
