import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import {
  Fragment,
  FragmentRenderableContent,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { CrdtRecordState } from "@elllphnt/elementa-utils";
import { map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { CrdtBaseRenderableContent } from "./_base.js";

export class CrdtFragmentRenderableContent
  extends CrdtBaseRenderableContent<"fragment">
  implements FragmentRenderableContent
{
  private _state: CrdtRecordState<Omit<FragmentRenderableContentData, "type">>;

  get fragmentId(): string | undefined {
    return this._state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this._state.entry$("fragmentId");
  }

  get fragment(): Fragment | undefined {
    return this.fragmentId
      ? this.environment.fragment(this.fragmentId)
      : undefined;
  }

  get fragment$(): Observable<Fragment | undefined> {
    return this.fragmentId$.pipe(
      switchMap((id) => (id ? this.environment.fragment$(id) : of(undefined)))
    );
  }

  get params(): Record<string, any> | undefined {
    return this._state.entry("params");
  }

  get params$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("params");
  }

  paramValue(name: string): any | undefined {
    return this._state.entry("params")?.[name];
  }

  paramValue$(name: string): Observable<any | undefined> {
    return this._state.entry$("params").pipe(map((params) => params?.[name]));
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
    super({
      crdt,
      type: "fragment",
      environment,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtFragmentRenderableContent({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
