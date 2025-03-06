import { WidgetComponent } from "@repo/elementa-renderer";
import { useObservable } from "@repo/utils";
import { ElementaStager } from "../elementa_stager";

export function Canvas({ renderer }: { renderer: ElementaStager }) {
  const widgets = useObservable(renderer.frames$, renderer.frames);

  return (
    <>
      {widgets.map((widget) => {
        return <WidgetComponent widget={widget} />;
      })}
    </>
  );
}
