import { File } from "@repo/backend";
import { useContext } from "react";
import { FileTreeContext } from "./_contexts";
import { useSortedFileTreeEntries } from "./_hooks";
import { FileTree } from "./file_tree";
import { FileTreeNewEntry } from "./new_entry";

export function FileTreeEntries({
  file,
  newDirectoryEntry,
  newFileEntry,
}: {
  file: File;
  newDirectoryEntry?: boolean;
  newFileEntry?: boolean;
}): JSX.Element {
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(file, {
    hidden: context?.hidden,
  });

  return (
    <>
      {newDirectoryEntry && <FileTreeNewEntry />}
      {directoryEntries?.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
      {newFileEntry && <FileTreeNewEntry />}
      {fileEntries?.map((entry) => <FileTree key={entry.id} file={entry} />)}
    </>
  );
}
