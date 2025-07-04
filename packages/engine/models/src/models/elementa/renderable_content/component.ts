import type { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import type { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import type { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class ComponentRenderableContent extends BaseRenderableContent<ComponentRenderableContentData> {
  get componentUrl(): string | undefined {
    return this.state.entry("componentUrl");
  }

  get componentUrl$(): Observable<string | undefined> {
    return this.state.entry$("componentUrl");
  }

  get component(): FileModelAdaptor<"component"> | undefined {
    let resolvedUrl: string | undefined = this.componentUrl;
    if (this.componentUrl === "host") {
      resolvedUrl = this.environment.hostUrl;
    }
    return resolvedUrl
      ? this.environment.project.infrastructure.component(
          this.environment.project.absoluteFileUrl(resolvedUrl)
        )
      : undefined;
  }

  get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
    return this.componentUrl$.pipe(
      map((url) => {
        let resolvedUrl: string | undefined = url;
        if (url === "host") {
          resolvedUrl = this.environment.hostUrl;
        }
        return resolvedUrl
          ? this.environment.project.infrastructure.component(
              this.environment.project.absoluteFileUrl(resolvedUrl)
            )
          : undefined;
      })
    );
  }

  get props(): Record<string, any> | undefined {
    return this.state.entry("props");
  }

  get props$(): Observable<Record<string, any> | undefined> {
    return this.state.entry$("props");
  }

  propValue(name: string): any | undefined {
    return this.state.entry("props")?.[name];
  }

  propValue$(name: string): Observable<any | undefined> {
    return this.state.entry$("props").pipe(map((props) => props?.[name]));
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<ComponentRenderableContentData>;
    environment: ElementaEnvironment;
  }) {
    super({
      state,
      type: "component",
      environment,
    });
  }
}
