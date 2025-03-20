import { PropsWithChildren, useState } from "react";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import {
  FileTreeContext,
  FileTreeContextType,
  NewEntry,
  RenameEntry,
} from "./_contexts";

export function FileTreeContextProvider({
  children,
  stateKey = ["fileTree"],
  ...base
}: PropsWithChildren<Partial<FileTreeContextType>>) {
  const [newEntry, setNewEntry] = useState<NewEntry | undefined>();
  const [renameEntry, setRenameEntry] = useState<RenameEntry | undefined>();
  const [showHidden, setShowHidden] = useWorkspaceState(
    [...stateKey, "showHidden"],
    false,
  );

  return (
    <FileTreeContext.Provider
      value={{
        ...base,
        stateKey,
        newEntry,
        renameEntry,
        setNewEntry,
        setRenameEntry,
        showHidden,
        setShowHidden,
      }}
    >
      {children}
    </FileTreeContext.Provider>
  );
}
