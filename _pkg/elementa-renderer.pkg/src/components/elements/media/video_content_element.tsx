import { VideoMediaContentData } from "@elllphnt/elll-element";
import { useNamespace } from "~/src/hooks/namespace";
import { MediaElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "../_/_base_element";
import MediaElementFallback from "./fallback";

export function VideoMediaElementComponent({
  element,
  content: contentData,
}: {
  element: MediaElementRenderable;
  content: VideoMediaContentData;
}): JSX.Element {
  const namespace = useNamespace();
  const srcValue = namespace.resolveValue(contentData.src);

  if (!srcValue) {
    return <MediaElementFallback element={element} />;
  }

  return (
    <BaseElementComponent
      element={element}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <video
        src={srcValue}
        autoPlay
        loop
        style={{
          width: "100%",
        }}
      />
    </BaseElementComponent>
  );
}

export default VideoMediaElementComponent;
