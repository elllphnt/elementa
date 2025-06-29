import { IdentifiableData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-core";
import { Model, RecordState } from "@elllphnt/elementa-utils";

export abstract class Identifiable<D extends IdentifiableData> extends Model<
  RecordState<D>
> {
  get id() {
    return this.state.entry("id");
  }

  constructor({
    state,
    initialized,
  }: {
    state: RecordState<D>;
    initialized?: boolean;
  }) {
    super({ state });

    if (!initialized) {
      this.state.set("id", genId());
    }
  }
}
