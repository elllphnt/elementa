import { useObservable } from "@elllphnt/elementa-react-utils";
import { ElementaStager } from "../elementa_stager";

export function Canvas({ renderer }: { renderer: ElementaStager }) {
  const frames = useObservable(renderer.frames$, renderer.frames);

  return (
    <>
      {frames.map((frame) => {
        return <WidgetComponent key={frame.id} widget={frame} />;
      })}
    </>
  );
}
