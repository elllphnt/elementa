import { Observable } from "rxjs";
import { PackageData, PackageManager } from "../project/_";

export class InMemoryPackageManager extends PackageManager {
  get packages(): PackageData[] {
    throw new Error("Method not implemented.");
  }
  get packages$(): Observable<PackageData[]> {
    throw new Error("Method not implemented.");
  }
  getPackages(): Promise<PackageData[]> {
    throw new Error("Method not implemented.");
  }
  installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    throw new Error("Method not implemented.");
  }
}
