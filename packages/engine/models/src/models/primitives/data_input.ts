import type { DataInputData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";

export class DataInput extends Model<RecordState<DataInputData>> {
  constructor({ state }: { state: RecordState<DataInputData> }) {
    super({ state });
  }

  // properties
  get name(): string {
    return this.state.entry("name") || "";
  }
  get name$(): Observable<string> {
    return this.state.entry$("name");
  }

  get varName(): string | undefined {
    return this.state.entry("varName");
  }
  get varName$(): Observable<string | undefined> {
    return this.state.entry$("varName");
  }

  get tsType(): string | undefined {
    return this.state.entry("tsType");
  }
  get tsType$(): Observable<string | undefined> {
    return this.state.entry$("tsType");
  }

  get required(): boolean | undefined {
    return this.state.entry("required");
  }
  get required$(): Observable<boolean | undefined> {
    return this.state.entry$("required");
  }

  get defaultValue(): any {
    return this.state.entry("defaultValue");
  }
  get defaultValue$(): Observable<any> {
    return this.state.entry$("defaultValue");
  }
}
