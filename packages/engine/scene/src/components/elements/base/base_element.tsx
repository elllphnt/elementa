import type { InteractionEvent } from "@elllphnt/elementa-base";
import { reactInteractionEventMap } from "@elllphnt/elementa-base";
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
  const interactions = useObservable(
    element.instance.element.interactions$,
    element.instance.element.interactions
  );

  const styleClass = element.instance.element.styleClass;
  const conditions = useObservable(
    styleClass.conditions$,
    styleClass.conditions
  );
  // `className={{ "is-active": expr }}`: apply each conditional class whose
  // expression is truthy in this element's scope (props, state, …).
  const conditionClassNames = Object.entries(conditions)
    .filter(([, expression]) =>
      Boolean(namespace.resolveExpression({ __expression: expression }))
    )
    .map(([conditionClassName]) => conditionClassName);

  const Component: any = tag || component || ("div" as any);
  const props: Record<string, any> = {
    className: cx(styleSheetClassName, conditionClassNames, className),
    children,
  };

  if (interactions) {
    for (const [key, value] of Object.entries(interactions)) {
      const prop = reactInteractionEventMap[key as InteractionEvent];
      if (prop) {
        props[prop] = namespace.resolveExpression(value) as any;
      }
    }
  }

  return (
    <Component
      {...props}
      ref={(ref: any) => {
        element.setHtmlElement(ref);
      }}
      data-elll-id={element.instance.element.id}
      data-elll-name={name}
    />
  );
}
