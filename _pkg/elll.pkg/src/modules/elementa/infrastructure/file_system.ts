import { ErrorTupple } from "@elllphnt/elll-element";
import {
  elllEntities,
  getUrlScheme,
  makeFileId,
  parseElllDriveFileUrl,
} from "@elllphnt/utils";
import { DriveFile, File, parseElllResourceUrl } from "@repo/backend";
import { FileSystem, Project } from "@repo/elementa-models";
import { of } from "rxjs";
import {
  getFileDriveId,
  makeAbsoluteDriveFileUrl,
  makeAbsoluteFileUrl,
  makeRelativeDriveFileUrl,
} from "~/src/libs/url";
import { getElllElementaProject } from "../project/_lib";
import { IElllElementaInfrastructure } from "./_types";

export class ElllElementaFileSystem extends FileSystem {
  readonly infrastructure: IElllElementaInfrastructure;

  fileContent(url: string) {
    return this.infrastructure.elll.contentManager.content<string>(url, "text")
      ?.data;
  }
  fileContent$(url: string) {
    return (
      this.infrastructure.elll.contentManager.content<string>(url, "text")
        ?.data$ ?? of(undefined)
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
  getAbsoluteDriveFileUrl(driveUrl: string, url: string): ErrorTupple<string> {
    return makeAbsoluteDriveFileUrl(driveUrl, url);
  }
  getRelativeDriveFileUrl(url: string): ErrorTupple<string> {
    return makeRelativeDriveFileUrl(url);
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

  async resolveContentUrl(url: string): Promise<{
    url: string;
    expiresAt?: number;
  }> {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "edf": {
        const urlStruct = parseElllDriveFileUrl(url);
        if (!urlStruct) {
          console.error(`Invalid elll drive file url: ${url}`);
          return Promise.resolve({ url });
        }
        const { drive_id, file_id } = urlStruct;
        const resourceId = makeFileId({
          entity: elllEntities.driveFile.name,
          bare_drive_id: drive_id,
          bare_file_id: file_id,
        });
        if (!resourceId) {
          console.error(`Invalid elll drive file url: ${url}`);
          return Promise.resolve({ url });
        }
        const driveFile = this.infrastructure.elll.backend.instance<DriveFile>(
          resourceId,
          true,
        );
        const contentUrl = await driveFile.getSignedFileUrl("read");
        return { url: contentUrl.url, expiresAt: contentUrl.expires };
      }
      default: {
        return Promise.resolve({ url });
      }
    }
  }
}
