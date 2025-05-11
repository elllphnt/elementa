import { ImageMediaData } from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../hooks/namespace.js";
import { MediaElementRenderable } from "../../../renderables/element/media.js";
import { BaseElementComponent } from "../_/_base_element.js";
import MediaElementFallback from "./fallback.js";

export function ImageMediaElementComponent({
  element,
  media,
}: {
  element: MediaElementRenderable;
  media: ImageMediaData;
}) {
  const namespace = useNamespace();
  const src = namespace.resolveValue(media.src);

  const fit = useObservable(
    element.instance.element.fit$,
    element.instance.element.fit
  );

  const fitValue = namespace.resolveValue<
    "contain" | "cover" | "fill" | "none" | "scale-down" | undefined
  >(fit);
  const srcValue = namespace.resolveValue(src);

  if (!srcValue) {
    return <MediaElementFallback element={element} />;
  }

  return (
    <BaseElementComponent
      element={element}
      style={{
        objectFit: fitValue,
      }}
      component="img"
      {...{
        src: srcValue,
      }}
    />
  );
}

export default ImageMediaElementComponent;
