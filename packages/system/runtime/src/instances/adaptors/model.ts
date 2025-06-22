import { ModelAdaptor } from "@elllphnt/elementa-core";
import { DiagnosticLevel } from "../../_shared/diagnosticable.js";
import { Runtime } from "../../runtime/runtime.js";
import { Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { InstanceAdaptor } from "./adaptor.js";

export class ModelInstanceAdaptor<
  M,
  I extends ModelInstance<M>,
  A extends ModelAdaptor<M> = ModelAdaptor<M>
> extends InstanceAdaptor<I> {
  readonly modelAdaptor: A;

  constructor({
    modelAdaptor,
    runtime,
    create,
    parent,
  }: {
    modelAdaptor: A;
    runtime: Runtime;
    create: (model: M) => I;
    parent?: Instance;
  }) {
    super({
      runtime,
      parent,
    });
    this.modelAdaptor = modelAdaptor;

    const modelSubscription = this.modelAdaptor.model$.subscribe((model) => {
      const current = this.instance;
      if (model) {
        this.setInstance(create(model));
      } else {
        this.setInstance(undefined);
      }
      current?.dispose();
    });

    this.modelAdaptor.error$.subscribe((error) => {
      if (error) {
        this.setDiagnostic("file-model", {
          level: DiagnosticLevel.Error,
          message: error.message,
        });
      } else {
        this.clearDiagnostic("file-model");
      }
    });

    this.addDisposer(() => {
      modelSubscription.unsubscribe();
    });
  }
}
