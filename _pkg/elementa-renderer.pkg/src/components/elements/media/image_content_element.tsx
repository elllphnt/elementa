import { ImageMediaData } from "@elllphnt/elll-element";
import { useObservable } from "@repo/utils";
import { useNamespace } from "~/src/hooks/namespace";
import { MediaElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "../_/_base_element";
import MediaElementFallback from "./fallback";

export function ImageMediaElementComponent({
  element,
  media,
}: {
  element: MediaElementRenderable;
  media: ImageMediaData;
}): JSX.Element {
  const namespace = useNamespace();
  const src = namespace.resolveValue(media.src);

  const fit = useObservable(element.entity.fit$, element.entity.fit);
  const position = useObservable(
    element.entity.position$,
    element.entity.position,
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
