import { File } from "~/infrastructure/_.js";
import { ModelAdaptor } from "./adaptor.js";

export interface FileModelAdaptor<M> extends ModelAdaptor<M> {
  readonly file: File;
}
