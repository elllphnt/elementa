import { Backend } from "./backend";
import { Factory } from "./factory";

export abstract class Service {
  readonly backend: Backend;

  constructor({ backend }: { backend: Backend }) {
    this.backend = backend;
  }
}

export type ServiceFactory<S extends Service = Service> = Factory<
  { backend: Backend },
  S
>;
