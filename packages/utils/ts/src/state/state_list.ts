import { ListState } from "./list.js";
import { State } from "./state.js";

export abstract class AggregatedStateList<
  S extends State
> extends ListState<S> {}
