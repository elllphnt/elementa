import { DriveFile, File } from "@repo/backend";
import { elllIcons16, Icon, ScrollArea, useAction } from "@repo/components";
import cx from "classnames";
import { useContext } from "react";
import { FileTreeContext } from "../file_tree/_contexts";
import { useFileDrop, useSortedFileTreeEntries } from "../file_tree/_hooks";
import { FileTreeContextProvider } from "../file_tree/file_tree_context_provider";
import { DriveDirectoryTree } from "./drive_directory_tree";

function DriveActions({ root }: { root: File }): JSX.Element {
  const context = useContext(FileTreeContext);
  useAction({
    title: "New file",
    icon: elllIcons16.plus,
    handler: () => {
      context?.setNewEntry?.({ parent: root, type: "file" });
    },
  });
  useAction({
    title: "New directory",
    icon: elllIcons16.directoryClosed,
    handler: () => {
      context?.setNewEntry?.({ parent: root, type: "directory" });
    },
  });
  return <></>;
}

function DriveDirectoryContent({
  directory,
}: {
  directory: DriveFile;
}): JSX.Element {
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden: context?.hiddenPattern,
  });

  const hasEntry = directoryEntries.length || fileEntries.length;
  const hasDirectoryNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type !== "directory";
  const hasNewEntry = hasDirectoryNewEntry || hasFileNewEntry;

  let content = <></>;

  const [dropRef, dropProps] = useFileDrop(directory);

  if (hasEntry || hasNewEntry) {
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
          <DriveDirectoryTree directory={directory} />
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

export function DriveDirectoryComponent({
  directory,
  hidden,
  contextMenuOptions,
}: {
  directory: DriveFile;
  hidden?: RegExp;
  contextMenuOptions?: (file: File, context?: any) => any[][];
}): JSX.Element {
  const handleNewEntry = async ({
    name,
    parent,
    type,
  }: {
    name: string;
    parent: File;
    type: string;
  }) => {
    const newFile = await parent.createEntry({ name, type });
    if (!newFile) return "Failed to create file";
  };

  const handleContextMenu = ({
    file,
    context,
  }: {
    file: File;
    context?: any;
  }) => {
    const options = [
      [
        {
          label: "Copy Drive URL",
          action: () => {
            navigator.clipboard.writeText((file as DriveFile).edfUrl);
          },
        },
        {
          label: "Open",
          action: () => {},
        },
        {
          label: "Delete",
          action: async () => await file.delete(),
        },
      ],
    ];
    if (contextMenuOptions) {
      const custom = contextMenuOptions(file, context);
      if (custom?.length) options.push(...custom);
    }
    return options;
  };

  const handleClick = ({ file }: { file: File }) => {};

  const acceptDrop = (event: DragEvent, directory: DriveFile) => {
    return event.dataTransfer?.types.includes("Files") ? "copy" : false;
  };
  const handleDrop = (event: DragEvent, directory: DriveFile) => {
    if (event.dataTransfer?.files.length) {
      directory.uploadFiles(event.dataTransfer.files);
      return true;
    }
  };

  return (
    <>
      <FileTreeContextProvider
        handleNewEntry={handleNewEntry}
        handleContextMenu={handleContextMenu}
        handleClick={handleClick}
        hiddenPattern={hidden}
        handleDrop={handleDrop as any}
        acceptDrop={acceptDrop as any}
      >
        <DriveActions root={directory} />
        <DriveDirectoryContent directory={directory} />
      </FileTreeContextProvider>
    </>
  );
}
