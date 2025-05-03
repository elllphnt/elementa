import { LinkData } from "@elllphnt/elementa-base";
import { ComponentType } from "react";
import { useNamespace } from "../../../hooks/namespace";
import { ElementRenderable } from "../../../renderables/element/element";

function LinkComponent({
  link,
  Component,
  props,
}: {
  link: LinkData;
  Component: ComponentType<any>;
  props: any;
}) {
  const namespace = useNamespace();
  // const linkValue = namespace.resolveValue(link) as LinkData | undefined;

  // const handleClick = useMemo(() => {
  //   if (linkValue?.href?.startsWith("/")) {
  //     return (e: MouseEvent<HTMLAnchorElement>) => {
  //       e.preventDefault();
  //       router.push(linkValue.href!);
  //     };
  //   } else {
  //     return (e: MouseEvent<HTMLAnchorElement>) => {};
  //   }
  // }, [linkValue?.href, router]);

  // return (
  //   <Component
  //     {...props}
  //     tag="a"
  //     href={linkValue?.href}
  //     hrefLang={linkValue?.hreflang}
  //     ping={linkValue?.ping?.join(" ")}
  //     referrerPolicy={linkValue?.referrerPolicy}
  //     rel={linkValue?.rel}
  //     target={linkValue?.target}
  //     onClick={handleClick}
  //   />
  // );

  return <></>;
}

export function LinkableElementComponent<
  P extends { element: ElementRenderable }
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    // const link = useObservable(
    //   element.instance.entity.link$,
    //   element.instance.entity.link
    // );

    // if (link) {
    //   return (
    //     <LinkComponent
    //       link={link}
    //       Component={ComponentElement}
    //       props={{
    //         element,
    //         ...props,
    //       }}
    //     />
    //   );
    // } else {
    return <ComponentElement element={element} {...(props as any)} />;
    // }
  };
}
