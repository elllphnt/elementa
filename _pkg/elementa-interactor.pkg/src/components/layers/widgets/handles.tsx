import { useObservable } from "@repo/utils";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";
import { ControllerWidgetHandleComponent } from "../../handles/widget/controller/controller";

export function WidgetHandleLayer() {
  const editor = useElementaInteractor();
  const controllers = useObservable(
    editor.controllerHandles$,
    editor.controllerHandles,
  );

  return (
    <>
      {controllers.map((controller) => (
        <ControllerWidgetHandleComponent
          key={controller.key}
          widget={controller}
        />
      ))}
    </>
  );
}
