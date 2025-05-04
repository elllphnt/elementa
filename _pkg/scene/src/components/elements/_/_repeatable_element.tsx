import { Evaluable } from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { ComponentType } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";
import { ElementRenderable } from "../../../renderables/element/element";

function RepeatedComponentItem({
  data,
  index,
  Component,
  props,
}: {
  data?: unknown;
  index: number;
  props: unknown;
  Component: ComponentType<unknown>;
}) {
  const namespace = useNamespace({ clone: true });
  namespace.set("$", {
    data,
    index,
  });
  namespace.set("index", index);
  namespace.set("item", data);

  return (
    <NamespaceContext.Provider key={namespace.key} value={namespace}>
      {namespace.key} <Component {...props} partKey={`item_${index}`} />
    </NamespaceContext.Provider>
  );
}

function FixedRepeatedComponent({
  count,
  Component,
  props,
}: {
  count: Evaluable<number>;
  Component: ComponentType<unknown>;
  props: Record<string, unknown>;
}) {
  const namespace = useNamespace();
  const resolvedCount = namespace.resolveValue<number | undefined>(count) ?? 1;

  const children = new Array<null>(resolvedCount).fill(null).map((_, index) => {
    return (
      <>
        <RepeatedComponentItem
          key={index}
          index={index}
          Component={Component}
          props={props}
        />
      </>
    );
  });

  return <>{children}</>;
}

function DynamicRepeatedComponent({
  Component,
  props,
  dataset,
}: {
  Component: ComponentType<any>;
  props: any;
  dataset?: Evaluable<any[]>;
}) {
  const namespace = useNamespace();
  const resolvedDataset = namespace.resolveValue(dataset);

  if (Array.isArray(resolvedDataset)) {
    return (
      <>
        {resolvedDataset.map((data, index) => {
          return (
            <RepeatedComponentItem
              key={index}
              index={index}
              data={data}
              Component={Component}
              props={props}
            />
          );
        })}
      </>
    );
  } else {
    return <></>;
  }
}

export function RepeatableElementComponent<
  P extends { element: ElementRenderable }
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    const repeat = useObservable(
      element.instance.element.repeat$,
      element.instance.element.repeat
    );

    if (repeat?.mode) {
      switch (repeat.mode) {
        case "fixed":
          return (
            <FixedRepeatedComponent
              count={repeat.count ?? 1}
              Component={ComponentElement}
              props={{
                element,
                ...props,
              }}
            />
          );
        case "dynamic":
          return (
            <DynamicRepeatedComponent
              dataset={repeat.dataset}
              Component={ComponentElement}
              props={{
                element,
                ...props,
              }}
            />
          );
      }
    } else {
      return <ComponentElement element={element} {...(props as any)} />;
    }
  };
}
