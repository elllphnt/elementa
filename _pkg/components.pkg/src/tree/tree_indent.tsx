import { PropsWithChildren, useContext } from "react";
import { TreeContext } from "./tree_context";

export function TreeIndent({
  indent = 1,
  children,
}: PropsWithChildren<{
  indent?: number;
}>) {
  const context = useContext(TreeContext);

  return (
    <TreeContext.Provider value={{ ...context, depth: context.depth + indent }}>
      {children}
    </TreeContext.Provider>
  );
}
