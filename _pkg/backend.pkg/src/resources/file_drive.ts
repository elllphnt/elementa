import { Query } from "../lib/store";
import { File } from "./file";

export interface IFileDrive<F extends File = File> {
  fileAtPath(
    path: string,
    options?: {
      autoFetch?: boolean;
      create?: {
        type: string;
      };
    },
  ): Query<F, F | undefined>;
}
