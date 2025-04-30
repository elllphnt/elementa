import { useObservable } from "@elllphnt/elementa-utils";
import { WidgetComponent } from "@elllphnt/elementa-scene";
import { ElementaStager } from "../elementa_stager";

export function Canvas({ renderer }: { renderer: ElementaStager }) {
  const widgets = useObservable(renderer.frames$, renderer.frames);

  return (
    <>
      {widgets.map((widget) => {
        return <WidgetComponent key={widget.key} widget={widget} />;
      })}
    </>
  );
}
