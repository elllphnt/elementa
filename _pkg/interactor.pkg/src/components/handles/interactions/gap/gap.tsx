import { useObservable } from "@repo/utils";
import { ContainerElementHandle, ElementHandle } from "~/src/handles/_";
import { FlexGapHandle } from "./flex";

export function GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const content = useObservable(handle.children$, handle.children);

  return (
    <FlexGapHandle container={handle} content={content as ElementHandle[]} />
  );
}
