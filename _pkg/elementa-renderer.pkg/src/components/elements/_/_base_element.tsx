import cx from "classnames";
import { PropsWithChildren, useEffect, useRef } from "react";
import { ElementRenderable } from "../../../renderables/instances/element/element";
import { HideableElementComponent } from "./_hideable_element";
import { InteractiveElementComponent } from "./_interactive_element";
import { LinkableElementComponent } from "./_linkable_element";
import { RepeatableElementComponent } from "./_repeatable_element";

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
  const ref = useRef<HTMLElement | null>(null);
  const styleSheetClassName = element.entity.cssStyleSheet.className;
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

  // expression style
  useEffect(() => {
    // const subscription = element.entity.styleOverrides$.subscribe((style) => {
    //   if (!ref.current) return;
    //   const resolvedStyle = namespace.resolveValue(style);
    //   if (typeof resolvedStyle === "object") {
    //     const css = styleToCss(resolvedStyle);
    //     for (const key in css) {
    //       ref.current.style.setProperty(key, (css as any)[key]);
    //     }
    //   }
    // });

    return () => {
      // subscription.unsubscribe();
    };
  });

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
      data-entity={`${element.entity.type}:${element.entity.id}`}
      ref={_ref}
      style={style}
      className={cx(styleSheetClassName, className)}
    >
      {children}
    </Component>
  );
}

export const BaseElementComponent = RepeatableElementComponent(
  InteractiveElementComponent(
    LinkableElementComponent(HideableElementComponent(RawBaseElementComponent)),
  ),
);
