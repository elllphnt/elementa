import { MediaContentData } from "@elllphnt/elll-element";
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
}): JSX.Element {
  const namespace = useNamespace();
  const content = useObservable(
    element.entity.content$,
    element.entity.content,
  );
  const resolvedContent = namespace.resolveValue(content) as MediaContentData;
  if (!resolvedContent) return <MediaElementFallback element={element} />;

  switch (resolvedContent.type) {
    case "image":
      return (
        <ImageMediaElementComponent
          key="image"
          element={element}
          content={resolvedContent}
        />
      );
    case "video":
      return (
        <VideoMediaElementComponent
          key="video"
          element={element}
          content={resolvedContent}
        />
      );
    default:
      return <MediaElementFallback element={element} />;
  }
}
