import { Observable, of, switchMap } from "rxjs";
import { ValueState } from "../rx/_.js";
import { Model, ModelData } from "./model.js";

export class OptionalModel<M extends Model<any>> extends Model<
  ModelData<M> | undefined
> {
  private readonly create: (data: ModelData<M>) => M;

  readonly state: ValueState<M | undefined>;

  get data(): ModelData<M> | undefined {
    return this.state.value?.data;
  }
  get data$(): Observable<ModelData<M> | undefined> {
    return this.state.value$.pipe(switchMap((v) => v?.data$ ?? of(undefined)));
  }

  constructor({
    init,
    create,
  }: {
    init?: ModelData<M> | undefined;
    create: (data: ModelData<M>) => M;
  }) {
    super();

    this.create = create;

    this.state = new ValueState({
      init: init != undefined ? create(init) : undefined,
    });

    this.addDisposer(() => {
      this.state.value?.dispose();
      this.state.dispose();
    });
  }

  restore(data: ModelData<M> | undefined) {
    this.state.setValue(data != undefined ? this.create(data) : undefined);
  }
}
