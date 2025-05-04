import { StaticReference } from "@elllphnt/elementa-base";
import { Project } from "./project/project";
import { File } from "./file/_";

export interface Infrastructure {
  // Resources

  file(url: string): File;
  project(url: string): Project;

  // URLs

  resolveAbsoluteUrl(
    projectUrl: string,
    relativeUrl: string
  ): string | undefined;
  resolveRelativeUrl(fileUrl: string): string | undefined;
  resolveProjectUrl(fileUrl: string): string | undefined;

  // References

  resolveStaticReference<T>(ref: StaticReference): Promise<T>;
}
