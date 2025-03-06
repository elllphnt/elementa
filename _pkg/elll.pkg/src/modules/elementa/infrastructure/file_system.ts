import { File, parseElllResourceUrl } from "@repo/backend";
import { FileSystem, Project } from "@repo/elementa-models";
import { of } from "rxjs";
import { getFileDriveId, makeAbsoluteFileUrl } from "~/src/libs/url";
import { getElllElementaProject } from "../project/_lib";
import { IElllElementaInfrastructure } from "./_types";

export class ElllElementaFileSystem extends FileSystem {
  readonly infrastructure: IElllElementaInfrastructure;

  fileContent(url: string) {
    return this.infrastructure.elll.contentManager.content(url, "text")?.data;
  }
  fileContent$(url: string) {
    return (
      this.infrastructure.elll.contentManager.content(url, "text")?.data$ ??
      of(undefined)
    );
  }

  fileName(url: string) {
    const { id } = parseElllResourceUrl(url);
    return this.infrastructure.elll.backend.instance<File>(id, true).name;
  }
  fileName$(url: string) {
    const { id } = parseElllResourceUrl(url);
    return this.infrastructure.elll.backend.instance<File>(id, true).name$;
  }

  constructor({
    infrastructure,
  }: {
    infrastructure: IElllElementaInfrastructure;
  }) {
    super();
    this.infrastructure = infrastructure;
  }

  getStandardFileUrl(url: string): string {
    return url;
  }
  getAbsoluteFileUrl(baseUrl: string, url: string): string {
    return makeAbsoluteFileUrl(baseUrl, url);
  }
  getFileProject(url: string): Project | undefined {
    const driveId = getFileDriveId(url);
    return driveId
      ? getElllElementaProject({
          elll: this.infrastructure.elll,
          driveId,
        })
      : undefined;
  }
}
