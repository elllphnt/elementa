import type { ElementaFrameData, ElementaStageData } from "@elllphnt/elementa-base";
import type {
  RecordState} from "@elllphnt/elementa-kernel";
import {
  AggregatedModelList,
  Model
} from "@elllphnt/elementa-kernel";
import type { ElementaEnvironment } from "./environment.js";
import { ElementaFrame } from "./frame.js";

export class ElementaStage extends Model<RecordState<ElementaStageData>> {
  readonly environment: ElementaEnvironment;

  private _frames: AggregatedModelList<
    RecordState<ElementaFrameData>,
    ElementaFrame
  >;

  get frames() {
    return this._frames.models;
  }

  get frames$() {
    return this._frames.models$;
  }

  constructor({
    state,
    environment,
    initialized,
  }: {
    state: RecordState<ElementaStageData>;
    environment: ElementaEnvironment;
    initialized?: boolean;
  }) {
    super({ state });
    this.environment = environment;

    this._frames = new AggregatedModelList({
      state: state.getListOfRecordStates("frames"),
      create: (state, init) => {
        return new ElementaFrame({
          state,
          stage: this,
          project: environment.project,
          initialized: init && initialized,
        });
      },
    });

    this.addInitializer(() => {
      this._frames.initialize();
      this.addDisposer(() => {
        this._frames.dispose();
      });
    });
  }
}
