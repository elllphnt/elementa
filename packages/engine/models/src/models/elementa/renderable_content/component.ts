import { ComponentRenderableContentData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { FileModelAdaptor } from "~/project/file/model_adaptor.js";
import { ElementaEnvironment } from "../environment.js";
import { BaseRenderableContent } from "./_base.js";

export class ComponentRenderableContent extends BaseRenderableContent<ComponentRenderableContentData> {
  get componentUrl(): string | undefined {
    return this.state.entry("componentUrl");
  }

  get componentUrl$(): Observable<string | undefined> {
    return this.state.entry$("componentUrl");
  }

  // get component(): FileModelAdaptor<"component"> | undefined {
  //   return this.componentUrl
  //     ? this.environment.project.infrastructure.component(
  //         this.environment.project.absoluteFileUrl(this.componentUrl)
  //       )
  //     : undefined;
  // }

  // get component$(): Observable<FileModelAdaptor<"component"> | undefined> {
  //   return this.componentUrl$.pipe(
  //     map((url) =>
  //       url
  //         ? this.environment.project.infrastructure.component(
  //             this.environment.project.absoluteFileUrl(url)
  //           )
  //         : undefined
  //     )
  //   );
  // }

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
  component: FileModelAdaptor<"component", File> | undefined;
  component$: Observable<FileModelAdaptor<"component", File> | undefined>;
}
