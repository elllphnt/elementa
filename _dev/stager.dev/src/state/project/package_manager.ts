import { PackageData, PackageManager } from "@elllphnt/elementa-models";
import { BehaviorSubject, Observable } from "rxjs";

export class LocalPackageManager extends PackageManager {
  private _packages = new BehaviorSubject<PackageData[]>([]);

  constructor() {
    super();
  }

  get packages(): PackageData[] {
    return this._packages.value;
  }

  get packages$(): Observable<PackageData[]> {
    return this._packages.asObservable();
  }

  async getPackages(): Promise<PackageData[]> {
    // In a real implementation, this would fetch packages from storage or API
    // For now, return mock data
    const mockPackages: PackageData[] = [
      { name: "core", version: "1.0.0", dependencies: {} },
      {
        name: "ui-components",
        version: "0.5.0",
        dependencies: { core: "^1.0.0" },
      },
    ];

    this._packages.next(mockPackages);
    return mockPackages;
  }

  async installPackages(
    packages: Array<Pick<PackageData, "name"> & Partial<PackageData>>
  ): Promise<PackageData[]> {
    // In real implementation, this would install packages and update dependencies
    const installedPackages: PackageData[] = packages.map((pkg) => ({
      name: pkg.name,
      version: pkg.version || "1.0.0",
      dependencies: pkg.dependencies || {},
    }));

    const updatedPackages = [...this._packages.value, ...installedPackages];
    this._packages.next(updatedPackages);

    return installedPackages;
  }
}
