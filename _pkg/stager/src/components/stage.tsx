import { useObservable } from "@elllphnt/elementa-utils";
import { ElementaStager } from "~/src/elementa_stager";
import { Canvas } from "./canvas";
import Viewport from "./viewport";

export function ElementaStage({
  renderer,
}: {
  renderer: ElementaStager;
}): JSX.Element {
  const visible = useObservable(renderer.visible$, renderer.visible);

  if (!visible) {
    return <></>;
  } else {
    return (
      <Viewport renderer={renderer}>
        <Canvas renderer={renderer} />
      </Viewport>
    );
  }
}

export default ElementaStage;
