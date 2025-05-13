import { ResourceStatus } from "../interfaces/_.js";
import { toAbsoluteFileUrl } from "../interfaces/file/url.js";
import { PackageData } from "../interfaces/project/managers/package_manager.js";
import { Project } from "../interfaces/project/project.js";
import { InMemoryInfrastructure } from "./infrastructure.js";
import { InMemoryPackageManager } from "./package_manager.js";
import { InMemoryResource } from "./resource.js";
import { InMemoryStyleManager } from "./style_manager.js";

export interface InMemoryProjectData {
  id: string;
  name?: string;
  styleManager?: ReturnType<InMemoryStyleManager["toJSON"]>;
  packageManager?: PackageData[];
}

export class InMemoryProject extends InMemoryResource implements Project {
  readonly infrastructure: InMemoryInfrastructure;
  readonly styleManager: InMemoryStyleManager;
  readonly packageManager: InMemoryPackageManager;
  private _name?: string;

  constructor({
    id,
    data,
    infrastructure,
    status,
  }: {
    id: string;
    data?: Omit<InMemoryProjectData, "id">;
    infrastructure: InMemoryInfrastructure;
    status?: ResourceStatus;
  }) {
    super({ id, status });
    this.infrastructure = infrastructure;
    this._name = data?.name;

    this.styleManager = new InMemoryStyleManager({
      data: data?.styleManager,
      project: this,
    });
    this.packageManager = new InMemoryPackageManager(
      data?.packageManager || []
    );
  }

  absoluteFileUrl(url: string): string {
    return toAbsoluteFileUrl({ url, projectId: this.id });
  }

  toJSON(): InMemoryProjectData {
    return {
      id: this.id,
      name: this._name,
      styleManager: this.styleManager.toJSON(),
      packageManager: this.packageManager.toJSON(),
    };
  }
}
