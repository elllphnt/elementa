import { VideoMediaData } from "@elllphnt/elementa-base";
import { useNamespace } from "~/src/hooks/namespace";
import { MediaElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "../_/_base_element";
import MediaElementFallback from "./fallback";

export function VideoMediaElementComponent({
  element,
  media,
}: {
  element: MediaElementRenderable;
  media: VideoMediaData;
}): JSX.Element {
  const namespace = useNamespace();
  const srcValue = namespace.resolveValue(media.src);

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
        autoPlay={media.autoplay}
        loop={media.loop}
        muted={media.muted}
        style={{
          width: "100%",
        }}
      />
    </BaseElementComponent>
  );
}

export default VideoMediaElementComponent;
