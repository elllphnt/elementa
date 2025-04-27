import { Reference } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "../project/project";
import { FileSystem } from "./file_system";

export abstract class Infrastructure {
  abstract get defaultProject(): Project | undefined;
  abstract get defaultProject$(): Observable<Project | undefined>;

  abstract get fileSystem(): FileSystem;
  abstract resolveReference(ref: Reference): Promise<any>;
}
