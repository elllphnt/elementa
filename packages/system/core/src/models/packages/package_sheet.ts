import { PackageData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export interface PackageSheet {
  get packages(): PackageData[];
  get packages$(): Observable<PackageData[]>;

  addPackage(packageData: PackageData): void;
  removePackage(name: string): void;
}
