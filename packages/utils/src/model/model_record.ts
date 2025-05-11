import { map, Observable, switchMap } from "rxjs";
import { reconcileMap } from "..";
import { combineLatestOrEmpty } from "../rx/_";
import { RecordState } from "../rx/record.js";
import { Model, ModelData } from "./model";

export class AggregatedModelRecord<M extends Model<unknown>> extends Model<
  Record<string, ModelData<M>>
> {
  private readonly create: (data: ModelData<M>) => M;

  readonly state: RecordState<Record<string, M>>;

  get data(): Record<string, ModelData<M>> {
    return Object.fromEntries(
      Object.entries(this.state.record).map(([key, model]) => [
        key,
        model.data as ModelData<M>,
      ])
    );
  }
  get data$(): Observable<Record<string, ModelData<M>>> {
    return this.state.record$.pipe(
      switchMap((record) =>
        combineLatestOrEmpty(
          Object.entries(record).map(([key, model]) =>
            model.data$.pipe(
              map((data) => [key, data] as [string, ModelData<M>])
            )
          )
        )
      ),
      map((entries) => Object.fromEntries(entries))
    );
  }

  constructor({
    init = {},
    create,
  }: {
    init?: Record<string, ModelData<M>>;
    create: (data: ModelData<M>) => M;
  }) {
    super();

    this.create = create;

    this.state = new RecordState<Record<string, M>>({
      init: Object.fromEntries(
        Object.entries(init).map(([key, data]) => [key, this.create(data)])
      ),
    });

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  restore(data: Record<string, ModelData<M>>) {
    const [next, removed] = reconcileMap({
      sources: data || {},
      targets: this.state.record,
      create: (raw) => this.create(raw),
      reconcile: (model, raw) => model.restore(raw),
    });

    this.state.setRecord(next);
    for (const model of Object.values(removed)) {
      model.dispose();
    }
  }
}
