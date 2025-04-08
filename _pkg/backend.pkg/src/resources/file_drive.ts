import { Query } from "../lib/store";
import { File } from "./file";

export interface IFileDrive<F extends File = File> {
  id: string;
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
