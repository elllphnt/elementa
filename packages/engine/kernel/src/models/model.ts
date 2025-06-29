import { State } from "~/state/state.js";
import { Lifecycle } from "../lifecycle.js";

export abstract class Model<S extends State = State> extends Lifecycle {
  readonly state: S;

  constructor({ state }: { state: S }) {
    super();
    this.state = state;
  }
}

export type StateOf<M> = M extends Model<infer S> ? S : never;
