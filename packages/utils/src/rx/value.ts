import { Observable } from "rxjs";
import { State } from "./state";

export class ValueState<D> extends State<D> {
  get value(): D {
    return super.value;
  }
  get value$(): Observable<D> {
    return super.value$;
  }

  constructor({ init }: { init: D }) {
    super({ init });
  }

  setValue(data: D): void {
    super.setValue(data);
  }
}
