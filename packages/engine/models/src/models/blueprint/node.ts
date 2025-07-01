import { BlueprintNodeData, genId } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { Identifiable } from "~/models/identifiable.js";
import { Project } from "~/project/project.js";
import { modelsLogger } from "../../loggers.js";

export class BlueprintNode extends Identifiable<BlueprintNodeData> {
  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<BlueprintNodeData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    modelsLogger.info("Creating blueprint node", {
      nodeId: this.id,
      projectId: project.id,
      initialized: initialized ?? false,
      position: this.position,
    });

    if (!initialized) {
      const newId = genId();
      const newPosition = { x: 0, y: 0 };
      state.set("id", newId);
      state.set("position", newPosition);

      modelsLogger.debug("Initializing new blueprint node", {
        nodeId: newId,
        projectId: project.id,
        position: newPosition,
      });
    }
  }

  get position(): { x: number; y: number } {
    return this.state.entry("position");
  }

  get position$(): Observable<{ x: number; y: number }> {
    return this.state.entry$("position");
  }

  setPosition(pos: { x: number; y: number }) {
    const oldPosition = this.position;
    modelsLogger.debug("Setting blueprint node position", {
      nodeId: this.id,
      projectId: this.project.id,
      oldPosition,
      newPosition: pos,
      positionChanged: oldPosition.x !== pos.x || oldPosition.y !== pos.y,
    });

    this.state.set("position", pos);

    modelsLogger.info("Blueprint node position updated", {
      nodeId: this.id,
      projectId: this.project.id,
      position: pos,
    });
  }
}
