import { ElementaFrameData, ElementaStageData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest } from "rxjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { ElementaFrame, ElementaStage } from "../../../../../_.js";
import { ElementaFrameModel } from "./frame.js";

export class ElementaStageModel
  extends Model<ElementaStageData>
  implements ElementaStage
{
  readonly project: Project;

  private _state: RecordState<Omit<ElementaStageData, "frames">>;
  private _frames: AggregatedModelList<ElementaFrameModel>;

  get frames(): ElementaFrameModel[] {
    return this._frames.state.items;
  }

  get frames$(): Observable<ElementaFrameModel[]> {
    return this._frames.state.items$;
  }

  get data(): ElementaStageData {
    return {
      ...this._state.record,
      frames: this._frames.data,
    };
  }

  get data$(): Observable<ElementaStageData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        frames: this._frames.data$,
      }),
    ]);
  }

  constructor({
    init,
    project,
  }: {
    init: ElementaStageData;
    project: Project;
  }) {
    const { frames, ...stateData } = init;
    super({ key: keyManager.next("elementa-stage") });

    this.project = project;

    this._state = new RecordState({
      init: stateData,
    });

    this._frames = new AggregatedModelList({
      init: frames || [],
      create: (data) => new ElementaFrameModel({ init: data, stage: this }),
      dataRef: (data) => data.id,
      modelRef: (model) => model.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._frames.dispose();
    });
  }

  addFrame(data: ElementaFrameData): void {
    this._frames.add(data);
  }
  removeFrame(frame: ElementaFrame): void {
    this._frames.state.remove((item) => item === frame);
  }

  restore(data: ElementaStageData) {
    const { frames, ...stateData } = data;

    this._state.setRecord(stateData);
    this._frames.restore(frames || []);
  }
}
