import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ElementaFrameRenderable } from "../../renderables/_";
import { RenderableContentComponent } from "./content/_content";

export function FrameComponent({
  frame,
}: {
  frame: ElementaFrameRenderable;
}): JSX.Element {
  return (
    <div
      ref={(element) => {
        frame.setHtmlElement(element);
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        contain: "layout style",
      }}
    >
      <FrameContent frame={frame} />
    </div>
  );
}

function FrameContent({
  frame,
}: {
  frame: ElementaFrameRenderable;
}): JSX.Element {
  const content = useObservable(frame.content$, frame.content);
  if (!content) return <></>;
  return <RenderableContentComponent content={content} />;
}

export default FrameComponent;
