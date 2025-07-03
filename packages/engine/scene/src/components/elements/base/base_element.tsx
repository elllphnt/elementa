import { useObservable } from "@elllphnt/elementa-react-utils";
import cx from "classnames";
import { useNamespace } from "../../../hooks/namespace.js";
import { useBaseElementProps } from "./context.js";

export function BaseElementComponent() {
  const namespace = useNamespace();
  const { element, component, children, className } = useBaseElementProps();
  const cssStyleSheet = element.instance.element.cssStyleSheet;
  const styleSheetClassName = cssStyleSheet.className;

  const tag = useObservable(
    element.instance.element.tag$,
    element.instance.element.tag
  );
  const name = useObservable(
    element.instance.element.name$,
    element.instance.element.name
  );
  const styleConditions = useObservable(
    cssStyleSheet.stylesheet.conditions$,
    cssStyleSheet.stylesheet.conditions
  );
  const Component: any = component || tag || ("div" as any);
  const props = {
    className: cx(styleSheetClassName, className),
    children,
  };

  return (
    <Component
      {...props}
      ref={(ref: any) => {
        element.setHtmlElement(ref);
      }}
      data-elll-id={element.instance.element.id}
      data-elll-name={element.instance.element.name}
    />
  );
}
