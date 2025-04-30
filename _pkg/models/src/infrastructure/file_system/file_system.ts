import { ErrorTupple } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export enum ResourceStatus {
  Pending = "loading",
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export interface Drive {
  url: string;
}

export interface File {
  url: string;
  drive: Drive;

  status: ResourceStatus;
  status$?: Observable<ResourceStatus>;

  error: Error | undefined;
  error$?: Observable<Error | undefined>;

  name: string;
  name$?: Observable<string>;

  type: string;
  type$?: Observable<string>;

  content: string;
  content$?: Observable<string>;
}

export interface FileSystem {
  file(url: string): File;

  getAbsoluteFileUrl(
    driveUrl: string,
    relativeUrl: string
  ): ErrorTupple<string>;
  getRelativeFileUrl(url: string): ErrorTupple<string>;
  getDriveUrl(fileUrl: string): string;
}
