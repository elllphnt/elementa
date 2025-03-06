import { TransformerData } from "@elllphnt/elll-element";
import { Entity } from "../entity";

export abstract class Transformer<
  D extends TransformerData = TransformerData,
> extends Entity<D> {
  remove(): void {
    this.component.removeTransformer(this);
  }
}
