import { StaticReference } from "@elllphnt/elementa-base";
import { Project } from "~/project/_.js";
import {
  InMemoryProject,
  InMemoryProjectData,
} from "../../project/_implementations/in_memory_project.js";
import { Infrastructure } from "../infrastructure.js";

export type InMemoryInfrastructureData = {
  projects: InMemoryProjectData[];
};

export class InMemoryInfrastructure extends Infrastructure {
  private _projects: Map<string, Project> = new Map();
  private _resolveStaticReference: (ref: StaticReference) => Promise<any>;

  project(id: string): Project {
    const project = this._projects.get(id);
    if (!project) {
      throw Error(`Project with id ${id} not found`);
    }
    return project;
  }
  resolveStaticReference<T>(ref: StaticReference): Promise<T> {
    return this._resolveStaticReference(ref);
  }

  constructor({
    data,
    resolveStaticReference,
  }: {
    data: InMemoryInfrastructureData;
    resolveStaticReference?: (ref: StaticReference) => Promise<any>;
  }) {
    super();
    this._projects = new Map(
      data.projects.map((projectData) => [
        projectData.id,
        new InMemoryProject({
          data: projectData,
          infrastructure: this,
        }),
      ])
    );

    this._resolveStaticReference =
      resolveStaticReference ??
      (() => {
        throw Error(`resolveStaticReference is not implemented`);
      });
  }
}
