import { File } from "@repo/backend";
import { useContext } from "react";
import { FileTreeContext } from "./_contexts";
import { useSortedFileTreeEntries } from "./_hooks";
import { FileTree } from "./file_tree";
import { FileTreeNewEntry } from "./new_entry";

export function FileTreeEntries({ file }: { file: File }): JSX.Element {
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(file);

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type !== "directory";

  return (
    <div className="el-space-y-0.5">
      {hasDirectoryNewEntry && <FileTreeNewEntry />}
      {directoryEntries?.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
      {hasFileNewEntry && <FileTreeNewEntry />}
      {fileEntries?.map((entry) => <FileTree key={entry.id} file={entry} />)}
    </div>
  );
}
