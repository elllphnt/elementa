import { File } from "@repo/backend";
import { useShell } from "@repo/shell";
import cx from "classnames";
import { ReactNode, useContext } from "react";
import { FileTreeContext } from "./_contexts";
import { useFileDrop, useSortedFileTreeEntries } from "./_hooks";
import { FileTree } from "./file_tree";
import { FileTreeNewEntry } from "./new_entry";

export function HeadlessFileTree({
  file,
  fitContent,
  extraEntries,
}: {
  file: File;
  fitContent?: boolean;
  extraEntries?: ReactNode;
}): JSX.Element {
  const shell = useShell();
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(file);

  const hasEntry = directoryEntries.length || fileEntries.length;
  const hasDirectoryNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type !== "directory";
  const hasNewEntry = hasDirectoryNewEntry || hasFileNewEntry;

  let content = <></>;

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const options = context?.handleContextMenu?.({ file, context });
    if (options?.length) {
      shell.showContextMenu({
        options,
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    }
  }

  const [dropRef, dropProps] = useFileDrop(file);

  if (hasEntry || hasNewEntry || extraEntries) {
    content = (
      <div
        ref={dropRef}
        style={{
          height: "fit-content",
        }}
        className={cx("el-w-full el-rounded el-space-y-0.5", {
          "el-bg-pm/10": dropProps.isDropTarget,
        })}
        onContextMenu={handleContextMenu}
      >
        {hasDirectoryNewEntry && <FileTreeNewEntry />}
        {directoryEntries?.map((entry) => (
          <FileTree key={entry.id} file={entry} />
        ))}
        {hasFileNewEntry && <FileTreeNewEntry />}
        {fileEntries?.map((entry) => <FileTree key={entry.id} file={entry} />)}
        {extraEntries}
        <div className="el-h-7" /> {/* bottom padding */}
      </div>
    );
  } else {
    const defaultFileType = context?.defaultFileType || "file";
    const defaultFileTypeName = context?.defaultFileTypeName || "file";

    function handleEmptyClick() {
      context?.setNewEntry?.({ parent: file, type: defaultFileType });
    }

    content = (
      <div
        ref={dropRef}
        className={cx(
          "el-text-fg el-p-3 el-text-sm el-flex el-flex-col el-gap-1 item-center el-justify-center el-text-center el-rounded hover:el-bg-bg-200/20 el-cursor-pointer el-transition-colors",
          {
            "el-h-full el-w-full": !fitContent,
            "el-bg-pm/10": dropProps.isDropTarget,
          },
        )}
        onClick={handleEmptyClick}
        onContextMenu={handleContextMenu}
      >
        <p>This directory is empty</p>
        <p>Click to create a new {defaultFileTypeName}</p>
      </div>
    );
  }

  return <>{content}</>;
}
