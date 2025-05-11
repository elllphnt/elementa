import { ElementaStageRenderable } from "../../renderables/_.js";

export function ElementaStageComponent({
  renderable,
}: {
  renderable: ElementaStageRenderable;
}) {
  return <>Stage ${renderable.key}</>;
}
