import { IFileDrive } from "@repo/backend";
import { PackageData } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { SynchronizedModelFile } from "../file";

export type PackageStoreData = {
  packages: PackageData[];
};

const mandatoryPackages: PackageData[] = [
  {
    name: "react",
    version: "18.3.1",
    registry: "npm",
  },
];

export class ElllPackageManager extends SynchronizedModelFile<PackageStoreData> {
  private _packages$ = new BehaviorSubject<PackageData[]>([
    ...mandatoryPackages,
  ]);

  get packages() {
    return this._packages$.value;
  }
  get packages$() {
    return this._packages$.asObservable();
  }

  get sourceData$() {
    return this._modelSourceData$.pipe(
      map(
        (data) =>
          data ?? {
            packages: [],
          },
      ),
    );
  }
  get data(): PackageStoreData {
    return {
      packages: this.packages,
    };
  }
  get data$() {
    return combineLatestOrEmpty([this.packages$]).pipe(
      map(([packages]) => {
        return {
          packages,
        };
      }),
    );
  }

  constructor({ elll, drive }: { elll: IElll; drive: IFileDrive }) {
    super({
      elll,
      drive,
      path: ".elll/packages",
      model: jsonModelConstructor.name,
    });

    this.watchData();
    this.addDisposer(() => {
      this._packages$.complete();
    });
  }

  installPackage(pkg: PackageData) {
    if (
      mandatoryPackages.find(
        (mpkg) => mpkg.name === pkg.name && mpkg.registry === pkg.registry,
      )
    ) {
      return;
    }

    const newPackages = [...this._packages$.value];
    const existingIndex = newPackages.findIndex(
      (_pkg) => _pkg.name === pkg.name && _pkg.registry === pkg.registry,
    );

    if (existingIndex === -1) {
      newPackages.push(pkg);
    } else {
      newPackages[existingIndex] = pkg;
    }

    this._packages$.next(newPackages);
  }
  removePackage(pkg: PackageData) {
    if (
      mandatoryPackages.find(
        (mpkg) => mpkg.name === pkg.name && mpkg.registry === pkg.registry,
      )
    ) {
      return;
    }

    this._packages$.next(
      this._packages$.value.filter(
        (_pkg) => !(_pkg.name === pkg.name && _pkg.registry === pkg.registry),
      ),
    );
  }

  restore(data: PackageStoreData): void {
    this._packages$.next([
      ...mandatoryPackages,
      ...(data.packages ?? []).filter(
        (pkg) =>
          !mandatoryPackages.find(
            (mpkg) => mpkg.name === pkg.name && mpkg.registry === pkg.registry,
          ),
      ),
    ]);
  }
}
