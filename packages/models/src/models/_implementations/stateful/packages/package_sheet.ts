import { PackageData, PackageSheetData } from "@elllphnt/elementa-base";
import { ListState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { PackageSheet } from "~/models/_.js";
import { File } from "~/project/_.js";
import { StatefulModel } from "../_base.js";

export class StatefulPackageSheet
  extends StatefulModel<PackageSheetData>
  implements PackageSheet
{
  // private properties
  private _packagesState: ListState<PackageData>;
  readonly file: File;

  constructor({ init, file }: { init: PackageSheetData; file: File }) {
    super();
    this.file = file;

    this._packagesState = new ListState({
      init: init.packages || [],
    });

    this.addDisposer(() => {
      this._packagesState.dispose();
    });
  }

  get packages(): PackageData[] {
    return this._packagesState.items;
  }

  get packages$(): Observable<PackageData[]> {
    return this._packagesState.items$;
  }

  get data(): PackageSheetData {
    return {
      packages: this.packages,
      __crdtAtomic: ["packages[*]"],
    };
  }

  get data$(): Observable<PackageSheetData> {
    return this.packages$.pipe(
      map((packages) => ({ packages, __crdtAtomic: ["packages[*]"] }))
    );
  }

  addPackage(packageData: PackageData): void {
    this._packagesState.append([packageData]);
  }

  removePackage(name: string): void {
    this._packagesState.remove((p) => p.name === name);
  }

  restore(data: PackageSheetData): void {
    this._packagesState.setItems(data.packages || []);
  }
}
