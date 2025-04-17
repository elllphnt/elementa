import {
  elllEntities,
  getUrlScheme,
  parseElllUrl,
  parseEntityId,
} from "@elllphnt/utils";
import { JsonCommitFileContent } from "~/src/contents/json_commit_file";
import { JsonWorkspaceFileContent } from "~/src/contents/json_workspace_file";
import { TextCommitFileContent } from "~/src/contents/text_commit_file";
import { TextWorkspaceFileContent } from "~/src/contents/text_workspace_file";
import { IElll } from "~/src/types/elll";
import { Content } from "./content";

export class ContentManager {
  readonly elll: IElll;

  private _contents: Record<string, Content> = {};

  content<T>(url: string, format: string): Content<T> | undefined {
    let content = this._contents[url];
    if (!content) {
      try {
        content = this._resolveContent(url, format);
      } catch (e) {
        console.error(e);
        this.elll.shell.toast(`Failed to resolve content for ${url}: ${e}`);
        return undefined;
      }
      this._contents[url] = content;
    }
    return content;
  }

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;
  }

  private _resolveWorkspaceFileContent(id: string, format: string): Content {
    switch (format) {
      case "json":
        return new JsonWorkspaceFileContent({ fileId: id, elll: this.elll });
      case "text":
        return new TextWorkspaceFileContent({ fileId: id, elll: this.elll });
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }
  private _resolveCommitFileContent(id: string, format: string): Content {
    switch (format) {
      case "json":
        return new JsonCommitFileContent({ fileId: id, elll: this.elll });
      case "text":
        return new TextCommitFileContent({ fileId: id, elll: this.elll });
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }

  private _resolveElllContent(id: string, format: string): Content {
    const idStruct = parseEntityId(id);
    if (!idStruct) {
      throw new Error(`Invalid entity id: ${id}`);
    }

    switch (idStruct.entity_name) {
      case elllEntities.workspaceFile.name:
        return this._resolveWorkspaceFileContent(id, format);
      case elllEntities.commitFile.name:
        return this._resolveCommitFileContent(id, format);
      default:
        throw new Error(`Unsuported entity type: ${idStruct.entity_name}`);
    }
  }
  private _resolveContent(url: string, format: string): Content {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      case "elll":
        const urlStruct = parseElllUrl(url);
        if (!urlStruct) {
          throw new Error(`Invalid elll url: ${url}`);
        }
        return this._resolveElllContent(urlStruct.id, format);
      default:
        throw new Error(`Unknown url scheme: ${scheme}`);
    }
  }
}
