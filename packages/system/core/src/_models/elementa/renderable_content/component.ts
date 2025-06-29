import { Observable } from "rxjs";
import { FileModelAdaptor } from "~/project/_.js";
import { BaseRenderableContent } from "./_base.js";

export interface ComponentRenderableContent
  extends BaseRenderableContent<"component"> {
  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  component: FileModelAdaptor<"component"> | undefined;
  component$: Observable<FileModelAdaptor<"component"> | undefined>;

  props: Record<string, any> | undefined;
  props$: Observable<Record<string, any> | undefined>;

  propValue(name: string): any | undefined;
  propValue$(name: string): Observable<any | undefined>;
}
