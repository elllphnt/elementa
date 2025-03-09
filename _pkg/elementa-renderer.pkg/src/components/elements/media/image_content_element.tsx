import { ImageMediaContentData } from "@elllphnt/elll-element";
import { useObservable } from "@repo/utils";
import { useNamespace } from "~/src/hooks/namespace";
import { MediaElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "../_/_base_element";
import MediaElementFallback from "./fallback";

export function ImageMediaElementComponent({
  element,
  content: contentData,
}: {
  element: MediaElementRenderable;
  content: ImageMediaContentData;
}): JSX.Element {
  const namespace = useNamespace();
  const srcValue = namespace.resolveValue(contentData.src);

  const fit = useObservable(element.entity.fit$, element.entity.fit);
  const position = useObservable(
    element.entity.position$,
    element.entity.position,
  );

  const fitValue = namespace.resolveValue(fit);
  const positionValue = namespace.resolveValue(position);

  if (!srcValue) {
    return <MediaElementFallback element={element} />;
  }

  return (
    <BaseElementComponent
      element={element}
      style={{
        objectFit: fitValue,
        objectPosition: positionValue,
      }}
      component="img"
      src={srcValue}
    />
  );
}

export default ImageMediaElementComponent;
