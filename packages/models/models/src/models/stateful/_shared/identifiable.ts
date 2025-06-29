import { IdentifiableData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";

export abstract class Identifiable<D extends IdentifiableData> extends Model<
  RecordState<D>
> {
  readonly id: string;

  constructor({ id, key }: { id: string; key?: string }) {
    super({ key });

    this.id = id;
  }
}
