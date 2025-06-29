import { PackageData } from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import { firstValueFrom, of, switchMap, timeout } from "rxjs";
import { Project } from "../project.js";

export class PackageManager extends Lifecycle {
  project: Project;

  get packageSheet() {
    return this.project.packageSheet.model;
  }
  get packageSheet$() {
    return this.project.packageSheet.model$;
  }

  get packages() {
    return this.packageSheet?.packages ?? [];
  }
  get packages$() {
    return this.packageSheet$.pipe(
      switchMap((packageSheet) => {
        return packageSheet?.packages$ ?? of([]);
      })
    );
  }

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;
  }

  getPackages(timeoutTime: number = 60_000) {
    return firstValueFrom(this.packages$.pipe(timeout(timeoutTime)));
  }
  async installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    const sheet = await firstValueFrom(
      this.packageSheet$.pipe(timeout(60_000))
    );
    if (!sheet) {
      throw Error(`Package Sheet could not be loaded.`);
    }
    const pkgs = await this.project.installPackages(packages);
    for (const pkg of pkgs) {
      sheet.addPackage(pkg);
    }
    return pkgs;
  }
}
