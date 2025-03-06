import { File } from "@repo/backend";
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
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(file);

  return (
    <>
      {newDirectoryEntry && <FileTreeNewEntry />}
      {directoryEntries?.map((entry) => (
        <FileTree key={file.id} file={entry} />
      ))}
      {newFileEntry && <FileTreeNewEntry />}
      {fileEntries?.map((entry) => <FileTree key={file.id} file={entry} />)}
    </>
  );
}
