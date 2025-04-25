import { useObservable } from "@repo/utils";
import { useNamespace } from "~/src/hooks/namespace";
import { MediaElementRenderable } from "~/src/renderables/instances/_";
import MediaElementFallback from "./fallback";
import ImageMediaElementComponent from "./image_content_element";
import VideoMediaElementComponent from "./video_content_element";

export function MediaElementComponent({
  element,
}: {
  element: MediaElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const namespace = useNamespace();
  const media = useObservable(element.entity.media$, element.entity.media);
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
