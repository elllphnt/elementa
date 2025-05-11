import { entityTypes } from "@elllphnt/elementa-base";
import { FrameWidget } from "@elllphnt/elementa-models";
import { RectData } from "@elllphnt/elementa-utils";
import { ElementaInteractor, tools } from "..";
import { FallbackHandle } from "../handles/fallback";
import { PointerEvent } from "../primitives/tool";
import { EntityTool } from "./entity";
import { createRectDrawInteraction } from "./interactions/rect_draw";

export class FrameTool extends EntityTool {
  constructor() {
    super({
      name: "frame",
      entityType: entityTypes.widgets.frame,
    });
  }

  down(event: PointerEvent) {
    if (!(event.target instanceof FallbackHandle)) {
      return;
    }

    const { interactor, position } = event;
    const component = interactor.stager.elementa.component;
    if (!component) return;

    const interaction = createRectDrawInteraction({
      interactor: interactor as ElementaInteractor,
      onEnd: (interfaceRect: RectData) => {
        const stagerRect =
          interactor.interface.rectInteractorToStager(interfaceRect);
        const rect = interactor.stager.viewport.rectWindowToContent(stagerRect);
        const frame = new FrameWidget({
          component,
        });

        frame.setX(rect.x);
        frame.setY(rect.y);
        frame.setHeight(rect.height);
        frame.setWidth(rect.width);

        component.addWidget(frame);
        event.interactor.toolManager.setTool(tools.Select);
        event.target.entityHandle(frame)?.select();
      },
      proportionalOnShift: true,
    });

    interaction.run(window, position);
  }
}
