import { BehaviorSubject, Observable } from "rxjs";
import {
  PackageData,
  PackageManager,
} from "../interfaces/project/managers/package_manager.js";

export class InMemoryPackageManager implements PackageManager {
  private _packages = new BehaviorSubject<PackageData[]>([]);
  private _disposed = false;

  get packages(): PackageData[] {
    return this._packages.getValue();
  }

  get packages$(): Observable<PackageData[]> {
    return this._packages.asObservable();
  }

  constructor(initialPackages: PackageData[] = []) {
    this._packages.next(initialPackages);
  }

  async getPackages(): Promise<PackageData[]> {
    return this.packages;
  }

  async installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    if (this._disposed) {
      throw new Error("Package manager has been disposed");
    }

    const currentPackages = [...this.packages];
    const newPackages: PackageData[] = [];

    for (const pkg of packages) {
      const existingIndex = currentPackages.findIndex(
        (p) => p.name === pkg.name
      );
      const newPackage: PackageData = {
        name: pkg.name,
        version: pkg.version || "latest",
        registry: pkg.registry || "npm",
      };

      if (existingIndex >= 0) {
        currentPackages[existingIndex] = newPackage;
      } else {
        currentPackages.push(newPackage);
        newPackages.push(newPackage);
      }
    }

    this._packages.next(currentPackages);
    return newPackages;
  }

  dispose(): void {
    if (!this._disposed) {
      this._packages.complete();
      this._disposed = true;
    }
  }

  toJSON(): PackageData[] {
    return this.packages;
  }

  restore(packages: PackageData[]): void {
    this._packages.next(packages);
  }
}
