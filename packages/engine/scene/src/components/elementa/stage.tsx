import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX } from "react";
import type { ElementaStageRenderable } from "../../renderables/elementa/stage/stage.js";
import FrameComponent from "./frame.js";
import Viewport from "./viewport.js";

function ElementaStageContent({
  stage,
}: {
  stage: ElementaStageRenderable;
}): JSX.Element {
  const frames = useObservable(stage.frames$, stage.frames);
  return (
    <>
      {frames.map((frame) => (
        <FrameComponent frame={frame} key={frame.key} />
      ))}
    </>
  );
}

export function ElementaStageComponent({
  stage,
}: {
  stage: ElementaStageRenderable;
}) {
  return (
    <Viewport stage={stage}>
      <ElementaStageContent stage={stage} />
    </Viewport>
  );
}
