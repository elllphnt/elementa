import { useObservable } from "@elllphnt/elementa-utils";
import cx from "classnames";
import { PropsWithChildren, useEffect, useRef } from "react";
import { useNamespace } from "~/src/hooks/namespace";
import { ElementRenderable } from "../../../renderables/instances/element/element";
import { HideableElementComponent } from "./_hideable_element";
import { InteractiveElementComponent } from "./_interactive_element";
import { LinkableElementComponent } from "./_linkable_element";

function RawBaseElementComponent({
  element,
  style,
  children,
  component = "div",
  className,
  partKey,
  onRef,
  ...props
}: PropsWithChildren<{
  element: ElementRenderable;
  style?: React.CSSProperties;
  className?: string;
  component?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}>): JSX.Element {
  const namespace = useNamespace();
  const ref = useRef<HTMLElement | null>(null);
  const styleSheetClassName = element.entity.cssStyleSheet.className;
  const dynamicStyles = useObservable(
    element.entity.stylesheet.dynamicStyles$,
    element.entity.stylesheet.dynamicStyles
  );
  const styleExpressions = useObservable(
    element.entity.stylesheet.expressions$,
    element.entity.stylesheet.expressions
  );
  const Component = component as any;

  useEffect(() => {
    if (partKey) {
      return () => {
        element.setHtmlElement(partKey, null);
      };
    } else {
      return () => {
        element.setHtmlElement(null);
      };
    }
  }, [element, partKey]);

  const _ref = (el: any) => {
    ref.current = el;

    if (partKey) {
      element.setHtmlElement(partKey, ref.current);
    } else {
      element.setHtmlElement(ref.current);
    }

    onRef?.(el);
  };

  const dynamicClasses = Object.fromEntries(
    Object.entries(dynamicStyles).map(([key, style]) => [
      style.className,
      namespace.resolveValue(
        styleExpressions[key.slice("__expression:".length)]
      ),
    ])
  );

  return (
    <Component
      {...props}
      __element={typeof Component === "string" ? undefined : element}
      data-entity={`${element.entity.type}:${element.entity.id}`}
      ref={_ref}
      style={style}
      className={cx(styleSheetClassName, className, dynamicClasses)}
    >
      {children}
    </Component>
  );
}

export const BaseElementComponent = InteractiveElementComponent(
  LinkableElementComponent(HideableElementComponent(RawBaseElementComponent))
);
