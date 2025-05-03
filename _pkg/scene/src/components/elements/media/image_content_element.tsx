import { ImageMediaData } from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../hooks/namespace";
import { MediaElementRenderable } from "../../../renderables/element/media";
import { BaseElementComponent } from "../_/_base_element";
import MediaElementFallback from "./fallback";

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
  const position = useObservable(
    element.instance.element.position$,
    element.instance.element.position
  );

  const fitValue = namespace.resolveValue(fit);
  const positionValue = {
    x: namespace.resolveValue(position?.x),
    y: namespace.resolveValue(position?.y),
  };
  const srcValue = namespace.resolveValue(src);

  if (!srcValue) {
    return <MediaElementFallback element={element} />;
  }

  return (
    <BaseElementComponent
      element={element}
      style={{
        objectFit: fitValue,
        objectPosition: ``, // todo,
      }}
      component="img"
      {...{
        src: srcValue,
      }}
    />
  );
}

export default ImageMediaElementComponent;
