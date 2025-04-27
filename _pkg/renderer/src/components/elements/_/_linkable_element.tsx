import { EvaluableMap, LinkData } from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-utils";
import { ComponentType, MouseEvent, useMemo } from "react";
import { useNamespace } from "~/src/hooks/namespace";
import { useRouter } from "~/src/hooks/router";
import { ElementRenderable } from "../../../renderables/instances/element/element";

function LinkComponent({
  link,
  Component,
  props,
}: {
  link: EvaluableMap<LinkData>;
  Component: ComponentType<any>;
  props: any;
}) {
  const namespace = useNamespace();
  const router = useRouter();
  const linkValue = namespace.resolveValue(link) as LinkData | undefined;

  const handleClick = useMemo(() => {
    if (linkValue?.href?.startsWith("/")) {
      return (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push(linkValue.href!);
      };
    } else {
      return (e: MouseEvent<HTMLAnchorElement>) => {};
    }
  }, [linkValue?.href, router]);

  return (
    <Component
      {...props}
      tag="a"
      href={linkValue?.href}
      hrefLang={linkValue?.hreflang}
      ping={linkValue?.ping?.join(" ")}
      referrerPolicy={linkValue?.referrerPolicy}
      rel={linkValue?.rel}
      target={linkValue?.target}
      onClick={handleClick}
    />
  );
}

export function LinkableElementComponent<
  P extends { element: ElementRenderable }
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    const link = useObservable(
      element.instance.entity.link$,
      element.instance.entity.link
    );

    if (link) {
      return (
        <LinkComponent
          link={link}
          Component={ComponentElement}
          props={{
            element,
            ...props,
          }}
        />
      );
    } else {
      return <ComponentElement element={element} {...(props as any)} />;
    }
  };
}
