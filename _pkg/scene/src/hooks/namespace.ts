import { Namespace } from "@elllphnt/elementa-runtime";
import { useContext } from "react";
import { NamespaceContext } from "../contexts/namespace";

export function useNamespace({
  clone,
}: {
  clone?: boolean;
} = {}) {
  const upstreamNamespace = useContext(NamespaceContext);
  if (clone) {
    return new Namespace({ ...upstreamNamespace.content });
  } else {
    return upstreamNamespace;
  }
}
