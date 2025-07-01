import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../../hooks/namespace.js";
import { MediaElementRenderable } from "../../../../renderables/element/media.js";
import MediaElementFallback from "./fallback.js";
import ImageMediaElementComponent from "./image_content_element.js";
import VideoMediaElementComponent from "./video_content_element.js";

export function MediaElementComponent({
  element,
}: {
  element: MediaElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const media = useObservable(
    element.instance.element.media$,
    element.instance.element.media
  );
  if (!media) return <MediaElementFallback element={element} />;

  switch (media.type) {
    case "image":
      return (
        <ImageMediaElementComponent
          key="image"
          element={element}
          media={media}
        />
      );
    case "video":
      return (
        <VideoMediaElementComponent
          key="video"
          element={element}
          media={media}
        />
      );
    default:
      return <MediaElementFallback element={element} />;
  }
}
