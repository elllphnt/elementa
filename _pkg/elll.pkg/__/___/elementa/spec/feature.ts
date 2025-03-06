import { init } from "@paralleldrive/cuid2";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { FeatureData } from "./_types";

type FeatureState = Omit<FeatureData, "id"> & {
  planning?: boolean;
};

export class Feature extends Disposable implements Datafiable<FeatureData> {
  static generateId = init({
    length: 7,
  });

  readonly id: string;

  private _state$ = new BehaviorSubject<FeatureState>({});

  get state$() {
    return this._state$.asObservable();
  }
  get state() {
    return this._state$.value;
  }

  get planning$() {
    return this.state$.pipe(map((state) => state.planning));
  }
  get planning() {
    return this.state.planning;
  }

  get data$() {
    return this.state$.pipe(
      map((state) => ({
        id: this.id,
        name: state.name,
        description: state.description,
      })),
    );
  }
  get data() {
    return {
      id: this.id,
      name: this.state.name,
      description: this.state.description,
    };
  }

  constructor({ id }: { id?: string } = {}) {
    super();
    this.id = id ?? Feature.generateId();

    this.addDisposer(() => {
      this._state$.complete();
    });
  }

  update(data: Partial<FeatureState>): void {
    this._state$.next({
      ...this._state$.value,
      ...data,
    });
  }

  setPlanning(planning: boolean): void {
    this.update({ planning });
  }

  restore(data: Omit<FeatureData, "id">): void {
    this._state$.next({
      ...this._state$.value,
      name: data.name,
      description: data.description,
    });
  }
}
