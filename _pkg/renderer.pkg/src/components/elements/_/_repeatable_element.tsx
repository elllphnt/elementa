import { Evaluable } from "@elllphnt/elll-element";
import { useObservable } from "@repo/utils";
import { ComponentType } from "react";
import { NamespaceContext } from "~/src/contexts/namespace";
import { useNamespace } from "~/src/hooks/namespace";
import { ElementRenderable } from "../../../renderables/instances/element/element";

function Test() {
  const namespace = useNamespace();

  return <>I{namespace.key}I</>;
}

function RepeatedComponentItem({
  data,
  index,
  Component,
  props,
}: {
  data?: any;
  index: number;
  props: any;
  Component: ComponentType<any>;
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
  Component: ComponentType<any>;
  props: any;
}) {
  const namespace = useNamespace();
  const resolvedCount = namespace.resolveValue(count) ?? 1;

  const children = new Array(resolvedCount).fill(null).map((_, index) => {
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
  P extends { element: ElementRenderable },
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    const repeat = useObservable(
      element.instance.entity.repeat$,
      element.instance.entity.repeat,
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
