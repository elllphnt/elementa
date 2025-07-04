import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import { useBaseElementProps } from "../base/context.js";

export function LinkProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps();

  const link = useObservable(
    props.element.instance.element.link$,
    props.element.instance.element.link
  );

  if (!link) return children;

  return <a href="/">{children}</a>;
}
