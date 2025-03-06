import { useObservable } from "@repo/utils";
import { useElementaInteractor } from "../../../hooks/elementa_interactor";
import { FrameWidgetHandleComponent } from "../../handles/widget/frame_widget";

export function ContentHandleLayer() {
  const interactor = useElementaInteractor();
  const frames = useObservable(interactor.frames$, interactor.frames);
  const ready = useObservable(
    interactor.stager.ready$,
    interactor.stager.ready,
  );

  if (!frames.length || !ready) {
    return <></>;
  }

  return (
    <>
      {frames.map((frame) => {
        return <FrameWidgetHandleComponent key={frame.key} widget={frame} />;
      })}
    </>
  );
}
