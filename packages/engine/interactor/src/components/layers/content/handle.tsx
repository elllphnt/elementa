import { useObservable } from "@elllphnt/elementa-react-utils";
import { useElementaInteractor } from "~/components/hooks/elementa_interactor.js";
import { FrameHandleComponent } from "../../handles/frame.js";

export function ContentHandleLayer() {
  const interactor = useElementaInteractor();
  const frames = useObservable(interactor.frames$, interactor.frames);

  return (
    <>
      {frames.map((frame) => {
        return <FrameHandleComponent key={frame.key} frame={frame} />;
      })}
    </>
  );
}
