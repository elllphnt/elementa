import { Namespace } from "@repo/elementa";
import { useContext } from "react";
import { NamespaceContext } from "../contexts/namespace";

export function useNamespace({
  clone,
}: {
  clone?: boolean;
} = {}) {
  const upstreamNamespace = useContext(NamespaceContext);
  if (clone) {
    return new Namespace(
      { ...upstreamNamespace.content },
      { ...upstreamNamespace.twoSlashMap },
    );
  } else {
    return upstreamNamespace;
  }
}
