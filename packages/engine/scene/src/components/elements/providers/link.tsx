import { useObservable } from "@elllphnt/elementa-react-utils";
import { Link, useRouter } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { useBaseElementProps } from "../base/context.js";

export function LinkProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps();
  const namespace = useNamespace();
  // A component can be staged on its own (outside any route), in which case
  // there is no <RouterProvider> above it and TanStack's <Link> would throw.
  const router = useRouter({ warn: false });

  const link = useObservable(
    props.element.instance.element.link$,
    props.element.instance.element.link
  );

  const resolved = namespace.resolveValue(link?.href);
  const href = resolved ? String(resolved) : undefined;
  if (!href) return children;

  if (!router) return <a href={href}>{children}</a>;
  return <Link to={href}>{children}</Link>;
}
