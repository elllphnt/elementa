import { Backend, Lifecycle, State } from "@elllphnt/elementa-kernel";

export class JsonState extends Lifecycle implements State {
  public readonly backend: Backend;

  constructor({ backend }: { backend: Backend }) {
    super();
    this.backend = backend;
  }
}
