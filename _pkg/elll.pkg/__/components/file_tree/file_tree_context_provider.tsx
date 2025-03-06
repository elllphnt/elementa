import { PropsWithChildren, useState } from "react";
import {
  FileTreeContext,
  FileTreeContextType,
  NewEntry,
  RenameEntry,
} from "./_contexts";

export function FileTreeContextProvider({
  children,
  ...overrides
}: PropsWithChildren<Partial<FileTreeContextType>>) {
  const [newEntry, setNewEntry] = useState<NewEntry | undefined>();
  const [renameEntry, setRenameEntry] = useState<RenameEntry | undefined>();

  return (
    <FileTreeContext.Provider
      value={{
        newEntry,
        renameEntry,
        setNewEntry,
        setRenameEntry,
        ...overrides,
      }}
    >
      {children}
    </FileTreeContext.Provider>
  );
}
