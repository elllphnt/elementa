import type { PackageData, PackageSheetData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import type { Project } from "~/project/project.js";
import { ProjectModel } from "../project.js";

export class PackageSheet extends ProjectModel<RecordState<PackageSheetData>> {
  get packages(): PackageData[] {
    return this.state.entry("packages") || [];
  }

  get packages$(): Observable<PackageData[]> {
    return this.state
      .entry$("packages")
      .pipe(map((packages) => packages || []));
  }

  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<PackageSheetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  addPackage(packageData: PackageData): void {
    const packages = [...this.packages, packageData];
    this.state.set("packages", packages);
  }

  removePackage(name: string): void {
    const packages = this.packages.filter((p) => p.name !== name);
    this.state.set("packages", packages);
  }
}
