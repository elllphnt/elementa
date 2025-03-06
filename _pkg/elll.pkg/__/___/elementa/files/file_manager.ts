import { File, parseElllResourceUrl } from "@repo/backend";
import { FileManager } from "@repo/elementa";
import { makeAbsoluteFileUrl } from "~/src/libs/url";
import { ElllProject } from "../project";

export class ElllFileManager extends FileManager {
  readonly project: ElllProject;

  fileContent(url: string) {
    return this.project.elll.contentManager.content(url, "text").data;
  }
  fileContent$(url: string) {
    return this.project.elll.contentManager.content(url, "text").data$;
  }

  fileName(url: string) {
    const { id } = parseElllResourceUrl(url);
    return this.project.elll.backend.instance<File>(id, true).name;
  }
  fileName$(url: string) {
    const { id } = parseElllResourceUrl(url);
    return this.project.elll.backend.instance<File>(id, true).name$;
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;
  }

  getStandardFileUrl(url: string): string {
    return url;
  }
  getAbsoluteFileUrl(baseUrl: string, url: string): string {
    return makeAbsoluteFileUrl(baseUrl, url);
  }
  async getFileContent(url: string): Promise<string> {
    return "";
  }
}
