import { VideoMediaData } from "@elllphnt/elementa-base";
import { useNamespace } from "../../../hooks/namespace.js";
import { MediaElementRenderable } from "../../../renderables/element/media.js";
import { BaseElementComponent } from "../_/_base_element.js";
import MediaElementFallback from "./fallback.js";

export function VideoMediaElementComponent({
  element,
  media,
}: {
  element: MediaElementRenderable;
  media: VideoMediaData;
}) {
  const namespace = useNamespace();
  const srcValue = namespace.resolveValue<string | undefined>(media.src);

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
        // autoPlay={media.autoplay}
        // loop={media.loop}
        // muted={media.muted}
        style={{
          width: "100%",
        }}
      />
    </BaseElementComponent>
  );
}

export default VideoMediaElementComponent;
