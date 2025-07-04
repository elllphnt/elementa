import { memo, useMemo } from "react";
import { renderingLogger } from "../../loggers.js";
import type { ElementRenderable } from "../../renderables/element/element.js";
import { ElementErrorBoundary } from "./_/_error_boundary.js";
import { BaseElementComponent } from "./base/base_element.js";
import { BaseElementPropsContext } from "./base/context.js";
import { ElementConditionProvider } from "./providers/condition.js";
import { LinkProvider } from "./providers/link.js";
import { ElementVariantProvider } from "./providers/variant.js";

export const ElementComponent = memo(function ({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const contextValue = useMemo(() => ({ element, onRef }), [element, onRef]);

  renderingLogger.debug(
    `ElementComponent ${
      element.instance.element.name || element.instance.element.id
    } (${element.instance.element.type})`,
    {
      elementType: element.instance.element.type,
      elementKey: element.key,
      element,
      onRef,
    }
  );
  return (
    <BaseElementPropsContext.Provider value={contextValue}>
      <ElementErrorBoundary element={element}>
        <ElementConditionProvider>
          <LinkProvider>
            <ElementVariantProvider>
              <BaseElementComponent />
            </ElementVariantProvider>
          </LinkProvider>
        </ElementConditionProvider>
      </ElementErrorBoundary>
    </BaseElementPropsContext.Provider>
  );
});

export default ElementComponent;
