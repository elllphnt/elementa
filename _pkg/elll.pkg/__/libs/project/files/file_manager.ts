import { FileManager } from "@repo/elementa";
import { of } from "rxjs";
import { ElllProject } from "../project";

export class ElllFileManager extends FileManager {
  readonly project: ElllProject;

  file(url: string) {
    return this.project.fileFromResourceUrl(this.project.urlToResourceUrl(url));
  }

  fileContent(url: string) {
    const file = this.file(url);
    if (!file.contentLoaded && !file.fetchingContent) {
      file.fetchContent();
    }
    return file?.textContent ?? undefined;
  }
  fileContent$(url: string) {
    const file = this.file(url);
    if (!file.contentLoaded && !file.fetchingContent) {
      file.fetchContent();
    }
    return file?.textContent$ ?? of(undefined);
  }

  fileName(url: string) {
    return this.file(url).name;
  }
  fileName$(url: string) {
    return this.file(url).name$;
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;
  }

  getStandardFileUrl(url: string): string {
    return this.project.urlToResourceUrl(url);
  }
  async getFileContent(url: string): Promise<string> {
    const file = this.file(url);
    await file.untilContentLoaded({ autoFetch: true });
    return file.textContent ?? "";
  }
}
