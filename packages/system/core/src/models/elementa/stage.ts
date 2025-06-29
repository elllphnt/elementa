import { ElementaFrameData, ElementaStageData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { ElementaEnvironment } from "./environment.js";

export class ElementaStage extends Model<RecordState<ElementaStageData>> {
  readonly environment: ElementaEnvironment;

  private _frames: AggregatedModelList<any, any>; // TODO: Fix typing

  get frames(): any[] {
    // TODO: Fix typing
    return this._frames.models;
  }

  get frames$(): Observable<any[]> {
    // TODO: Fix typing
    return this._frames.models$;
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<ElementaStageData>;
    environment: ElementaEnvironment;
  }) {
    super({ state });

    this.environment = environment;

    // TODO: Implement proper aggregated model list for frames
    this._frames = {} as any;
  }

  // TODO: Implement frame management methods
  createFrame(data: Partial<ElementaFrameData>): any {
    return null;
  }

  removeFrame(id: string): void {
    // TODO: Implement
  }
}
