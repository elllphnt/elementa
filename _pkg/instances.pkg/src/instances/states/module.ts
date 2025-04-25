import { ModuleState } from "@repo/elementa-models";
import { map, of, switchMap } from "rxjs";
import { Elementa } from "../../elementa";
import { Instance } from "../instance";
import { StateInstance } from "./state";

export class ModuleStateInstance extends StateInstance<ModuleState> {
  get module() {
    const url = this.entity.absoluteModuleUrl;
    return url ? this.elementa.moduleManager.module(url) : undefined;
  }
  get module$() {
    return this.entity.absoluteModuleUrl$.pipe(
      switchMap((url) => {
        return url ? this.elementa.moduleManager.module$(url) : of(undefined);
      }),
    );
  }

  get use() {
    return this.module?.default;
  }
  get use$() {
    return this.module$.pipe(
      map((module) => {
        return module?.default;
      }),
    );
  }

  get properties() {
    return this.module?.properties;
  }
  get properties$() {
    return this.module$.pipe(
      map((module) => {
        return module?.properties;
      }),
    );
  }

  constructor({
    entity,
    elementa,
    parent,
  }: {
    entity: ModuleState;
    elementa: Elementa;
    parent: Instance | null;
  }) {
    super({ entity, elementa, parent });
  }
}
