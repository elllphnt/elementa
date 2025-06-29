import { Lifecycle } from "../core/_.js";
import { State } from "../state/_.js";

export abstract class Model<S extends State = State> extends Lifecycle {
  readonly state: S;

  constructor({ state }: { state: S }) {
    super();
    this.state = state;
  }
}

export type StateOf<M> = M extends Model<infer S> ? S : never;
