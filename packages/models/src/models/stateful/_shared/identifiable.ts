import { IdentifiableData } from "@elllphnt/elementa-base";
import { Model } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Identifiable } from "../../_interfaces/_shared/identifiable.js";

export abstract class IdentifiableModel<D extends IdentifiableData>
  extends Model<D>
  implements Identifiable
{
  readonly id: string;

  get _data(): IdentifiableData {
    return {
      id: this.id,
    };
  }
  get _data$(): Observable<IdentifiableData> {
    return of({
      id: this.id,
    });
  }

  constructor(data: D) {
    super();

    this.id = data.id;
  }

  restore(data: IdentifiableData): void {
    if (data.id !== this.id) {
      throw new Error(
        `Cannot restore data with id ${data.id} to model with id ${this.id}`
      );
    }
  }
}
