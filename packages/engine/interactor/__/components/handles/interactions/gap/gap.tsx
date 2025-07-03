import { useObservable } from "@elllphnt/elementa-utils";
import { ContainerElementHandle, ElementHandle } from "~/handles/_";
import { FlexGapHandle } from "./flex.js";

export function GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const content = useObservable(handle.children$, handle.children);

  return (
    <FlexGapHandle container={handle} content={content as ElementHandle[]} />
  );
}
