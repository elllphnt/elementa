import { Observable } from "rxjs";

export type PackageData = {
  name: string;
  version: string;
  registry: string;
};

export interface PackageManager {
  readonly packages: PackageData[];
  readonly packages$: Observable<PackageData[]>;

  getPackages(): Promise<PackageData[]>;
  installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]>;
}
