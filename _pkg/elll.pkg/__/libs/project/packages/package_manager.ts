import { PackageManager } from "@repo/elementa";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, debounceTime, map } from "rxjs";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const packagesFilePath = ".elll/packages.json";

export type PackageData = {
  name: string;
  version: string;
  registry: string;
};

export type PackageStoreData = {
  packages: PackageData[];
};

const mandatoryPackages: PackageData[] = [
  {
    name: "react",
    version: "18.3.1",
    registry: "npm",
  },
  {
    name: "@react-spring/web",
    version: "9.7.3",
    registry: "npm",
  },
];

export class ElllPackageManager extends PackageManager {
  readonly project: ElllProject;
  readonly persitor: Persistor<PackageStoreData>;

  private _packages$ = new BehaviorSubject<PackageData[]>([
    ...mandatoryPackages,
  ]);

  get elll() {
    return this.project.elll;
  }

  get packages() {
    return this._packages$.value;
  }
  get packages$() {
    return this._packages$.asObservable();
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

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    this.persitor = new Persistor<PackageStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(packagesFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(packagesFilePath, {
          type: mimeTypes.json,
        }),
    });

    const restoreSubscription = this.persitor.data$.subscribe((data) => {
      this.restore(data);
    });
    const saveSubscription = this.data$
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.persitor.save(data);
      });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.persitor.dispose();
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
