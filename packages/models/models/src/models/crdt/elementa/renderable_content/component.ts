import { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import {
  ComponentRenderableContent,
  ElementaEnvironment,
  FileModelAdaptor,
} from "@elllphnt/elementa-core";
import { CrdtRecordState } from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseRenderableContent } from "./_base.js";

export class CrdtComponentRenderableContent
  extends CrdtBaseRenderableContent<"component">
  implements ComponentRenderableContent
{
  private _state: CrdtRecordState<Omit<ComponentRenderableContentData, "type">>;

  get componentUrl(): string | undefined {
    return this._state.entry("componentUrl");
  }

  get componentUrl$(): Observable<string | undefined> {
    return this._state.entry$("componentUrl");
  }

  get component(): FileModelAdaptor<"component"> | undefined {
    return this.componentUrl
      ? this.environment.project.infrastructure.component(
          this.environment.project.absoluteFileUrl(this.componentUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
    return this.componentUrl$.pipe(
      map((url) =>
        url
          ? this.environment.project.infrastructure.component(
              this.environment.project.absoluteFileUrl(url)
            )
          : undefined
      )
    );
  }

  get props(): Record<string, any> | undefined {
    return this._state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this._state.entry$("props");
  }

  propValue(name: string): any | undefined {
    return this._state.entry("props")?.[name];
  }

  propValue$(name: string): Observable<any | undefined> {
    return this._state.entry$("props").pipe(map((props) => props?.[name]));
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementaEnvironment;
    initialized?: boolean;
  }) {
    super({
      crdt,
      type: "component",
      environment,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtComponentRenderableContent({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
