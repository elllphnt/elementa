import {
  AnchorProviderContext,
  ColumnControlContainer,
} from "@repo/components";
import { PropsWithChildren, useRef } from "react";

export function Sheet({
  children,
  title,
  noIndent,
  noPadding,
  noXPadding,
  noYPadding,
}: PropsWithChildren<{
  title?: string;
  noIndent?: boolean;
  noPadding?: boolean;
  noXPadding?: boolean;
  noYPadding?: boolean;
}>) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <AnchorProviderContext.Provider
      value={{
        getAnchor: () => ref.current ?? undefined,
      }}
    >
      <ColumnControlContainer
        ref={ref}
        indent={!noIndent}
        title={title}
        noPadding={noPadding}
        noXPadding={noXPadding}
        noYPadding={noYPadding}
      >
        {children}
      </ColumnControlContainer>
    </AnchorProviderContext.Provider>
  );
}
