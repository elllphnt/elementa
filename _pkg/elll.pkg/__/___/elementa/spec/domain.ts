import { init } from "@paralleldrive/cuid2";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { DomainData } from "./_types";

type DomainState = Omit<DomainData, "id">;

export class Domain extends Disposable implements Datafiable<DomainData> {
  static generateId = init({
    length: 7,
  });

  readonly id: string;

  private _state$ = new BehaviorSubject<DomainState>({});

  get state$() {
    return this._state$.asObservable();
  }
  get state() {
    return this._state$.value;
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
    this.id = id ?? Domain.generateId();

    this.addDisposer(() => {
      this._state$.complete();
    });
  }

  update(data: Partial<DomainState>): void {
    this._state$.next({
      ...this._state$.value,
      ...data,
    });
  }

  restore(data: Omit<DomainData, "id">): void {
    this._state$.next({
      ...this._state$.value,
      name: data.name,
      description: data.description,
    });
  }
}
