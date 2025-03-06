import {
  elllEntities,
  getUrlScheme,
  parseElllUrl,
  parseEntityId,
} from "@elllphnt/utils";
import { IElll } from "../../elll/_types";
import { Content } from "./content";
import { JsonWorkspaceFileContent } from "./contents/json_workspace_file";

export class ContentManager {
  readonly elll: IElll;

  private _contents: Record<string, Content> = {};

  content(url: string, format: string): Content {
    let content = this._contents[url];
    if (!content) {
      content = this._resolveContent(url, format);
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
