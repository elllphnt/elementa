import { StaticReference } from "@elllphnt/elementa-base";
import { Infrastructure, Project } from "@elllphnt/elementa-core";

export class SingleProjectInfrastructure extends Infrastructure {
  private _project: Project;
  private _resolveStaticReference: (ref: StaticReference) => Promise<any>;

  project(id: string): Project {
    if (id !== this._project.id) {
      throw new Error(
        `Project with id ${id} does not exist in this infrastructure.`
      );
    }
    return this._project;
  }
  resolveStaticReference<T>(ref: StaticReference): Promise<T> {
    return this._resolveStaticReference(ref);
  }

  constructor({
    project,
    resolveStaticReference,
  }: {
    project: Project;
    resolveStaticReference?: (ref: StaticReference) => Promise<any>;
  }) {
    super();
    this._project = project;
    this._resolveStaticReference =
      resolveStaticReference ??
      (() => {
        throw Error(`resolveStaticReference is not implemented`);
      });
  }
}
