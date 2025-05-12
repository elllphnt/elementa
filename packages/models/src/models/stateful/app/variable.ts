import { AppVariableData } from "@elllphnt/elementa-base";
import {
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { AppVariable } from "../../_interfaces/app/variable.js";
import { AppModel } from "./app.js";

export class AppVariableModel
  extends Model<AppVariableData>
  implements AppVariable
{
  private _state: RecordState<Partial<AppVariableData>>;
  private _app: AppModel;

  constructor({ init, app }: { init: AppVariableData; app: AppModel }) {
    super();

    this._app = app;

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get app(): AppModel {
    return this._app;
  }

  get data(): AppVariableData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<AppVariableData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: AppVariableData) {
    this._state.setRecord(data);
  }

  get varName(): string | undefined {
    return this._state.record.varName;
  }

  get varName$(): Observable<string | undefined> {
    return this._state.entry$("varName");
  }

  get name(): string | undefined {
    return this._state.record.name;
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  get tsType(): string | undefined {
    return this._state.record.tsType;
  }

  get tsType$(): Observable<string | undefined> {
    return this._state.entry$("tsType");
  }

  get scope(): string | undefined {
    return this._state.record.scope;
  }

  get scope$(): Observable<string | undefined> {
    return this._state.entry$("scope");
  }

  get description(): string | undefined {
    return this._state.record.description;
  }

  get description$(): Observable<string | undefined> {
    return this._state.entry$("description");
  }
}
