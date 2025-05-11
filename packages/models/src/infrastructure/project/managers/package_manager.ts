import { Disposable } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export type PackageData = {
  name: string;
  version: string;
  registry: string;
};

export abstract class PackageManager extends Disposable {
  abstract get packages(): PackageData[];
  abstract get packages$(): Observable<PackageData[]>;

  abstract getPackages(): Promise<PackageData[]>;
  abstract installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]>;
}
