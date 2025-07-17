import { useObservable } from "@elllphnt/elementa-react-utils";
import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { useBaseElementProps } from "../base/context.js";

export function LinkProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps();
  const namespace = useNamespace();

  const link = useObservable(
    props.element.instance.element.link$,
    props.element.instance.element.link
  );

  const href = namespace.resolveValue(link?.href);
  if (!href) return children;

  return <Link to={href}>{children}</Link>;
}
