import { FragmentRenderableContentData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable, of, switchMap } from "rxjs";
import { Fragment } from "~/models/fragment/fragment.js";
import { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class FragmentRenderableContent extends BaseRenderableContent<FragmentRenderableContentData> {
  get fragmentId(): string | undefined {
    return this.state.entry("fragmentId");
  }

  get fragmentId$(): Observable<string | undefined> {
    return this.state.entry$("fragmentId");
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
    return this.state.entry("params");
  }

  get params$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("params");
  }

  paramValue(name: string): any | undefined {
    return this.state.entry("params")?.[name];
  }

  paramValue$(name: string): Observable<any | undefined> {
    return this.state.entry$("params").pipe(map((params) => params?.[name]));
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<FragmentRenderableContentData>;
    environment: ElementaEnvironment;
  }) {
    super({
      state,
      type: "fragment",
      environment,
    });
  }
}
