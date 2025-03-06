import * as Tooltip_ from "@radix-ui/react-tooltip";
import { PropsWithChildren, ReactNode } from "react";

export function Tooltip({
  content,
  children,
  delayDuration,
  skipDelayDuration,
  sideOffset,
  side,
}: PropsWithChildren<{
  content?: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
}>) {
  return (
    <Tooltip_.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <Tooltip_.Root>
        <Tooltip_.Trigger asChild>{children}</Tooltip_.Trigger>
        <Tooltip_.Portal>
          <Tooltip_.Content
            sideOffset={sideOffset}
            side={side}
            className="el-border el-rounded el-py-0.5 el-px-1 el-bg-bg"
            style={{
              zIndex: 1000,
            }}
          >
            {content}
          </Tooltip_.Content>
        </Tooltip_.Portal>
      </Tooltip_.Root>
    </Tooltip_.Provider>
  );
}
