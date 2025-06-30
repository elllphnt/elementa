import { SlotFill } from "@elllphnt/elementa-models";
import { Observable, of } from "rxjs";
import { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
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
    environment: ElementRuntimeEnvironment;
    props?: { [key: string]: unknown };
    slotFills?: { [key: string]: SlotFill | undefined };
  }) {
    super({ environment });
    this._props = props || {};
    this._slotFills = slotFills || {};
  }
}
