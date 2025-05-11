import { useObservable } from "@elllphnt/elementa-react-utils";
import cx from "classnames";
import { JSX, PropsWithChildren, useEffect, useRef } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { ElementRenderable } from "../../../renderables/element/element.js";
import { HideableElementComponent } from "./_hideable_element.js";
import { InteractiveElementComponent } from "./_interactive_element.js";
import { LinkableElementComponent } from "./_linkable_element.js";

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
  const cssStyleSheet = element.instance.element.cssStyleSheet;
  const styleSheetClassName = cssStyleSheet.className;
  const styleConditions = useObservable(
    cssStyleSheet.stylesheet.conditions$,
    cssStyleSheet.stylesheet.conditions
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

  return (
    <Component
      {...props}
      __element={typeof Component === "string" ? undefined : element}
      data-entity={`${element.instance.element.type}:${element.instance.element.id}`}
      ref={_ref}
      style={style}
      className={cx(styleSheetClassName, className)}
    >
      {children}
    </Component>
  );
}

export const BaseElementComponent = InteractiveElementComponent(
  LinkableElementComponent(HideableElementComponent(RawBaseElementComponent))
);
