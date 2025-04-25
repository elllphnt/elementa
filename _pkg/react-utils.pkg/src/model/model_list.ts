import { Observable, switchMap } from "rxjs";
import { ReactiveList } from "../hooks/list";
import { combineLatestOrEmpty } from "../hooks/operators";
import { IModel } from "./model";

export class ReactiveModelList<D, M extends IModel<D>> extends ReactiveList<M> {
  private readonly createModel: (data: D) => M;
  private readonly identifyData: (data: D) => string | number;
  private readonly identifyModel: (model: M) => string | number;

  constructor({
    createModel,
    identifyData,
    identifyModel,
  }: {
    createModel: (data: D) => M;
    identifyData: (data: D) => string | number;
    identifyModel: (model: M) => string | number;
  }) {
    super();

    this.createModel = createModel;
    this.identifyData = identifyData;
    this.identifyModel = identifyModel;
  }

  get data(): D[] {
    return this.items.map((m) => m.data);
  }

  get data$(): Observable<D[]> {
    return this.items$.pipe(
      switchMap((items) => combineLatestOrEmpty(items.map((i) => i.data$))),
    );
  }

  restore(data?: D[]): void {
    this.reconcile<D, string | number>({
      sources: data || [],
      create: (raw) => this.createModel(raw),
      sourceRef: (raw) => this.identifyData(raw),
      targetRef: (model) => this.identifyModel(model),
      reconcile: (model, raw) => model.restore(raw),
      dispose: (model) => model.dispose(),
    });
  }
}
