import { StaticReference } from "@elllphnt/elementa-base";
import { File } from "./file/_";
import { Project } from "./project/project";

export interface Infrastructure {
  // Resources

  file(url: string): File;
  project(id: string): Project;

  // References

  resolveStaticReference<T>(ref: StaticReference): Promise<T>;
}
