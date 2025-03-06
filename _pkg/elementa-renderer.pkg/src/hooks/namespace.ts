import { useContext } from "react";
import { NamespaceContext } from "../contexts/namespace";
import { Namespace } from "@repo/elementa";

export function useNamespace({
  clone,
}: {
  clone?: boolean;
} = {}) {
  const upstreamNamespace = useContext(NamespaceContext);
  if (clone) {
    return new Namespace(
      upstreamNamespace.content,
      upstreamNamespace.twoSlashMap,
    );
  } else {
    return upstreamNamespace;
  }
}
