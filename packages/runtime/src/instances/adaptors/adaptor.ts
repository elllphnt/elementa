import { BehaviorSubject } from "rxjs";
import { Runtime } from "../../runtime/runtime.js";
import { ElementaInstanceType, Instance } from "../instance.js";

export abstract class InstanceAdaptor<I extends Instance> extends Instance {
  private _instance$ = new BehaviorSubject<I | undefined>(undefined);

  get instance$() {
    return this._instance$.asObservable();
  }
  get instance() {
    return this._instance$.value;
  }

  constructor({ runtime, parent }: { runtime: Runtime; parent?: Instance }) {
    super({
      type: ElementaInstanceType.Adaptor,
      runtime,
      parent,
    });

    this.addDisposer(() => {
      this._instance$.complete();
    });
  }

  protected setInstance(instance: I | undefined) {
    this._instance$.next(instance);
  }
}
