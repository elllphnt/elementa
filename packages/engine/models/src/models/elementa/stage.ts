import { ElementaFrameData, ElementaStageData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { modelsLogger } from "../../loggers.js";
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

    modelsLogger.info("Creating elementa stage", {
      projectId: environment.project.id,
      hostUrl: environment.hostUrl,
    });

    this.environment = environment;

    // TODO: Implement proper aggregated model list for frames
    this._frames = new AggregatedModelList({
      state: state.getListOfRecordStates("frames"),
      create: (state) => {
        // TODO: Implement proper frame creation
        return {} as any;
      },
    });

    this.addInitializer(() => {
      modelsLogger.debug("Initializing elementa stage frames", {
        projectId: environment.project.id,
        framesCount: this._frames.models.length,
      });

      this._frames.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing elementa stage frames", {
          projectId: environment.project.id,
          framesCount: this._frames.models.length,
        });
        this._frames.dispose();
      });
    });
  }

  // TODO: Implement frame management methods
  createFrame(data: Partial<ElementaFrameData>): any {
    return null;
  }

  removeFrame(id: string): void {
    // TODO: Implement
  }
}
