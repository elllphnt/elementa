import { IdentifiableData } from "@elllphnt/elementa-base";
import { Observable, of } from "rxjs";
import { Identifiable } from "~/models/_shared/_.js";
import { StatefulModel } from "../_base.js";

export abstract class StatefulIdentifiable<D extends IdentifiableData>
  extends StatefulModel<D>
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

  constructor({ id, key }: { id: string; key?: string }) {
    super({ key });

    this.id = id;
  }

  restore(data: IdentifiableData): void {
    if (data.id !== this.id) {
      throw new Error(
        `Cannot restore data with id ${data.id} to model with id ${this.id}`
      );
    }
  }
}
