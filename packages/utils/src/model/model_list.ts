import { Observable } from "rxjs";
import { reconcileList } from "../core/_";
import { combineLatestOrEmpty } from "../rx/_";
import { ListState } from "../rx/list.js";
import { Model, ModelData } from "./model";

export class AggregatedModelList<M extends Model<unknown>> extends Model<
  ModelData<M>[]
> {
  private readonly create: (data: ModelData<M>) => M;
  private readonly dataRef: (data: ModelData<M>) => unknown;
  private readonly modelRef: (model: M) => unknown;

  readonly state: ListState<M>;

  get data(): ModelData<M>[] {
    return this.state.items.map((model) => model.data as ModelData<M>);
  }
  get data$(): Observable<ModelData<M>[]> {
    return combineLatestOrEmpty(
      this.state.items.map((model) => model.data$ as Observable<ModelData<M>>)
    );
  }

  constructor({
    init = [],
    create,
    dataRef,
    modelRef,
  }: {
    init?: ModelData<M>[];
    create: (data: ModelData<M>) => M;
    dataRef: (data: ModelData<M>) => string | number;
    modelRef: (model: M) => string | number;
  }) {
    super();

    this.create = create;
    this.dataRef = dataRef;
    this.modelRef = modelRef;

    this.state = new ListState<M>({
      init: init.map((data) => this.create(data)),
    });

    this.addDisposer(() => {
      this.state.dispose();
    });
  }

  add(item: ModelData<M>): void {
    this.state.add(this.create(item));
  }
  insertAt(index: number, items: ModelData<M>[]): void {
    this.state.insertAt(
      index,
      items.map((d) => this.create(d))
    );
  }
  append(items: ModelData<M>[]): void {
    this.state.append(items.map((d) => this.create(d)));
  }
  prepend(items: ModelData<M>[]): void {
    this.state.prepend(items.map((d) => this.create(d)));
  }

  restore(data: ModelData<M>[]) {
    const [next, removed] = reconcileList({
      sources: data || [],
      targets: this.state.items,
      create: (raw) => this.create(raw),
      sourceRef: (raw) => this.dataRef(raw),
      targetRef: (model) => this.modelRef(model),
      reconcile: (model, raw) => model.restore(raw),
    });

    this.state.setItems(next);
    for (const model of removed) {
      model.dispose();
    }
  }
}
