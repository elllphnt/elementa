import { Observable } from "rxjs";
import { FileModel } from "../../../../file/_.js";
import { Component } from "../../../component.js";
import { BaseRenderableContent } from "./_base.js";

export interface ComponentRenderableContent
  extends BaseRenderableContent<"component"> {
  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  component: FileModel<Component> | undefined;
  component$: Observable<FileModel<Component> | undefined>;

  props: Record<string, any> | undefined;
  props$: Observable<Record<string, any> | undefined>;

  propValue(name: string): any | undefined;
  propValue$(name: string): Observable<any | undefined>;
}
