import { ensureField } from "@elllphnt/crdt";
import { PackageData } from "@elllphnt/elementa-base";
import { File, PackageSheet } from "@elllphnt/elementa-core";
import { CrdtModel, CrdtRecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";

export class CrdtPackageSheet
  extends CrdtModel<y.Map<any>>
  implements PackageSheet
{
  readonly file: File;
  private _state: CrdtRecordState<{ packages: PackageData[] }>;

  get packages(): PackageData[] {
    return this._state.entry("packages") || [];
  }

  get packages$(): Observable<PackageData[]> {
    return this._state.entry$("packages");
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ crdt });
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "packages", () => []);
      ensureField(crdt, "__crdtAtomic", () => ["packages[*]"]);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  addPackage(packageData: PackageData): void {
    const packages = [...this.packages, packageData];
    this._state.set("packages", packages);
  }

  removePackage(name: string): void {
    const packages = this.packages.filter((p) => p.name !== name);
    this._state.set("packages", packages);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtPackageSheet({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
