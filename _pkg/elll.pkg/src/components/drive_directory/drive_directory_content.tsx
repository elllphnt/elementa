import { DriveFile, File } from "@repo/backend";
import { elllIcons16, Icon, ScrollArea } from "@repo/components";
import cx from "classnames";
import { useFileDrop, useSortedFileTreeEntries } from "../file_tree/_hooks";
import { DriveDirectoryTree } from "./drive_directory_tree";

export function DriveDirectoryContent({
  directory,
  hidden,
  contextMenuOptions,
}: {
  directory: DriveFile;
  hidden?: RegExp;
  contextMenuOptions?: (file: File, context?: any) => any[][];
}): JSX.Element {
  const [dropRef, dropProps] = useFileDrop(directory, {
    acceptDrop: (event) => {
      return event.dataTransfer?.types.includes("Files") ? "copy" : false;
    },
    handleDrop: (event) => {
      if (!event.dataTransfer) return false;
      directory.uploadFiles(event.dataTransfer.files);
      return true;
    },
  });
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden,
  });

  let content;

  if (directoryEntries.length || fileEntries.length) {
    content = (
      <div
        ref={dropRef}
        className={cx("el-w-full el-h-full", {
          "el-bg-pm/10": dropProps.isDropTarget,
        })}
      >
        <ScrollArea
          scrollY
          containerClassName="el-px-2 el-pb-2 el-pt-1 el-flex el-flex-col el-space-y-0.5"
        >
          <DriveDirectoryTree
            directory={directory}
            hidden={hidden}
            contextMenuOptions={contextMenuOptions}
          />
        </ScrollArea>
      </div>
    );
  } else {
    content = (
      <div
        ref={dropRef}
        className={cx(
          "el-h-full el-w-full el-p-3 el-flex el-flex-col el-gap-1 el-items-center el-justify-center el-text-center hover:el-bg-bg-200/20 el-cursor-pointer el-transition-colors el-text-fg-300",
          {
            "el-bg-pm/10": dropProps.isDropTarget,
          },
        )}
      >
        <Icon name={elllIcons16.drive} />
        <p>This storage is empty.</p>
        <p>Drag and drop files here to upload new content.</p>
      </div>
    );
  }

  return <>{content}</>;
}
