import { DataInputData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { DataInput } from "../../_interfaces/component/data_input.js";
import { BaseModel } from "../_base.js";

export class DataInputModel
  extends BaseModel<DataInputData>
  implements DataInput
{
  private _state: RecordState<DataInputData>;

  constructor({ init }: { init: DataInputData }) {
    super();

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  // data getters
  get data(): DataInputData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<DataInputData> {
    return this._state.record$;
  }

  // properties
  get name(): string {
    return this._state.entry("name") || "";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
  }

  get varName(): string | undefined {
    return this._state.entry("varName");
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  get tsType(): string | undefined {
    return this._state.entry("tsType");
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }

  get required(): boolean | undefined {
    return this._state.entry("required");
  }

  get required$(): Observable<boolean | undefined> {
    return this._state.entry$("required");
  }

  get defaultValue(): any {
    return this._state.entry("defaultValue");
  }

  get defaultValue$(): Observable<any> {
    return this._state.entry$("defaultValue");
  }

  // restore method
  restore(data: DataInputData): void {
    this._state.setRecord(data);
  }
}
