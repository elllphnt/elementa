import type { Observable } from "rxjs";
import { AsyncResource } from "../resource.js";
import type { File } from "./file.js";

export abstract class Content<F extends File> extends AsyncResource {
  readonly file: F;

  abstract get text(): string;
  abstract get text$(): Observable<string>;

  constructor({ file }: { file: F }) {
    super();
    this.file = file;
  }
}
