import type { Model } from "@elllphnt/elementa-kernel";
import type { ModelAdaptor } from "@elllphnt/elementa-models";
import { DiagnosticLevel } from "../../_shared/diagnosticable.js";
import type { Runtime } from "../../runtime/runtime.js";
import type { Instance } from "../instance.js";
import type { ModelInstance } from "../model.js";
import { InstanceAdaptor } from "./adaptor.js";

export class ModelInstanceAdaptor<
  M extends Model,
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
        const instance = create(model);
        this.addLifecycle(instance);
        this.setInstance(instance);
      } else {
        this.setInstance(undefined);
      }
      if (current) {
        current.dispose();
        this.removeLifecycle(current);
      }
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
