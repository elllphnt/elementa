import { PackageData, PackageSheetData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";

export class PackageSheet extends Model<RecordState<PackageSheetData>> {
  readonly file: File;

  get packages(): PackageData[] {
    return this.state.entry("packages") || [];
  }

  get packages$(): Observable<PackageData[]> {
    return this.state.entry$("packages");
  }

  constructor({
    state,
    file,
  }: {
    state: RecordState<PackageSheetData>;
    file: File;
  }) {
    super({ state });
    this.file = file;

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
