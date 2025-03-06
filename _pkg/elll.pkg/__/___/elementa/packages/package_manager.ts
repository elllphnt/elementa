import { PackageManager } from "@repo/elementa";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, of, switchMap } from "rxjs";
import { mimeTypes } from "~/src/libs/mimetypes";
import { jsonModelConstructor } from "~/src/models/json";
import { IElll } from "~/src/types/elll";
import { elllFileAtPath, elllFileAtPath$ } from "../_utils";
import { ElllProject } from "../project";

const packagesFilePath = ".elll/packages";

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
];

export class ElllPackageManager extends PackageManager {
  readonly project: ElllProject;

  private _packages$ = new BehaviorSubject<PackageData[]>([
    ...mandatoryPackages,
  ]);

  get elll(): IElll {
    return this.project.elll;
  }

  get file() {
    return elllFileAtPath(this.elll, packagesFilePath, {
      type: mimeTypes.json,
    });
  }
  get file$() {
    return elllFileAtPath$(this.elll, packagesFilePath, {
      type: mimeTypes.json,
    });
  }

  get model() {
    return this.file
      ? this.elll.modelManager.getModel(
          jsonModelConstructor.name,
          this.file.url,
        )
      : undefined;
  }
  get model$() {
    return this.file$.pipe(
      map((file) =>
        file
          ? this.elll.modelManager.getModel(jsonModelConstructor.name, file.url)
          : undefined,
      ),
    );
  }

  get contentData$() {
    return this.model$.pipe(
      switchMap((model) => (model ? model.content.data$ : of({}))),
    );
  }
  get contentData() {
    return this.model?.content.data ?? {};
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

    let syncing = false;
    // Restore data
    const restoreSubscription = this.contentData$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.restore(data);
      } finally {
        syncing = false;
      }
    });
    // Save data
    const saveSubscription = this.data$.subscribe((data) => {
      if (syncing) return;
      try {
        syncing = true;
        this.model?.content.update(data);
      } finally {
        syncing = false;
      }
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

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
