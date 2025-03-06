import { File } from "@repo/backend";
import { ContextMenuOption, ProgressBar, ScrollArea } from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useContext } from "react";
import { useWorkspaceFileAtPath } from "../../hooks/backend/file";
import { FileTreeContext, FileTreeContextType } from "../file_tree/_contexts";
import { useFileDrop, useSortedFileTreeEntries } from "../file_tree/_hooks";
import { WorkspaceDirectoryTree } from "./workspace_directory_tree";

function WorkspaceDirectoryContent({
  directory,
  hidden,
  fileTypes = [],
  contextMenuOptions,
  defaultFileTypeName,
  defaultFileType,
}: {
  directory: File;
  hidden?: RegExp;
  fileTypes?: Array<{
    type: string;
    name: string;
  }>;
  contextMenuOptions?: (
    file: File,
    context?: FileTreeContextType,
  ) => ContextMenuOption[][];
  defaultFileType: string;
  defaultFileTypeName: string;
}): JSX.Element {
  const shell = useShell();
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden: context?.hidden,
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

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const options = context?.handleContextMenu?.({ file: directory, context });
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

  const [dropRef, dropProps] = useFileDrop(directory);

  if (hasEntry || hasNewEntry) {
    content = (
      <div
        ref={dropRef}
        className={cx("el-w-full el-h-full el-text-fg-400", {
          "el-bg-pm/10": dropProps.isDropTarget,
        })}
        onContextMenu={handleContextMenu}
      >
        <ScrollArea
          scrollY
          containerClassName="el-px-2 el-pb-2 el-pt-1 el-flex el-flex-col el-space-y-0.5"
        >
          <WorkspaceDirectoryTree
            directory={directory}
            hidden={hidden}
            fileTypes={fileTypes}
            contextMenuOptions={contextMenuOptions}
            defaultFileType={defaultFileType}
            defaultFileTypeName={defaultFileTypeName}
          />
        </ScrollArea>
      </div>
    );
  } else {
    const defaultFileType = context?.defaultFileType || "file";
    const defaultFileTypeName = context?.defaultFileTypeName || "file";

    function handleEmptyClick() {
      context?.setNewEntry?.({ parent: directory, type: defaultFileType });
    }

    content = (
      <div
        ref={dropRef}
        className={cx(
          "el-h-full el-w-full el-text-fg el-p-3 el-flex el-flex-col el-gap-1 item-center el-justify-center el-text-center hover:el-bg-bg-200/20 el-cursor-pointer el-transition-colors el-text-fg-400",
          {
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

export function WorkspaceDirectoryView({
  path,
  fileTypes = [],
  defaultFileType,
  defaultFileTypeName,
  contextMenuOptions,
  hidden,
}: {
  path: string;
  fileTypes?: Array<{
    type: string;
    name: string;
  }>;
  defaultFileType: string;
  defaultFileTypeName: string;
  contextMenuOptions?: (
    file: File,
    context?: FileTreeContextType,
  ) => ContextMenuOption[][];
  hidden?: RegExp;
}): JSX.Element {
  const [directory, query] = useWorkspaceFileAtPath(path, {
    type: "directory",
  });
  const fetching = useObservable(query?.fetching$, query?.fetching);

  if (fetching) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        <div className="font-mono">/{path}</div>
        <div
          style={{
            width: 40,
          }}
        >
          <ProgressBar />
        </div>
      </div>
    );
  }

  if (!directory) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        Directory not found
        <div className="font-mono">/{path}</div>
      </div>
    );
  }

  return (
    <WorkspaceDirectoryContent
      directory={directory}
      hidden={hidden}
      fileTypes={fileTypes}
      contextMenuOptions={contextMenuOptions}
      defaultFileType={defaultFileType}
      defaultFileTypeName={defaultFileTypeName}
    />
  );
}
