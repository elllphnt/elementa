import { File } from "@repo/backend";
import { ScrollArea } from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useContext } from "react";
import { FileTreeContext } from "../../trees/file_tree/_contexts";
import {
  useFileDrop,
  useSortedFileTreeEntries,
} from "../../trees/file_tree/_hooks";
import { FileTreeContextProvider } from "../../trees/file_tree/file_tree_context_provider";
import { FileTreeEntries } from "../../trees/file_tree/file_tree_entries";
import { useWorkspaceFileTreeContext } from "../../trees/workspace_directory/_context";
import { WorkspaceDirectoryTreeActions } from "../../trees/workspace_directory/actions";
import { DrawerEmpty } from "../_common/drawer_empty";
import { DrawerLoader } from "../_common/drawer_loader";

export function WorkspaceDirectoryDrawerContent({
  root,
}: {
  root: File;
}): JSX.Element {
  const shell = useShell();
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries, query] = useSortedFileTreeEntries(root);

  const fetching = useObservable(query?.fetching$, query?.fetching);
  const error = useObservable(query?.error$, query?.error);

  const [dropRef, dropProps] = useFileDrop(root);

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === root &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === root &&
    context?.newEntry?.type !== "directory";

  const hasEntry =
    directoryEntries.length ||
    fileEntries.length ||
    hasDirectoryNewEntry ||
    hasFileNewEntry;

  if (!hasEntry && fetching) {
    return <DrawerLoader message="Fetching entries..." />;
  } else if (!hasEntry && error) {
    return (
      <DrawerEmpty>
        <p>
          Failed to load entries.
          <br />
          Click{" "}
          <span
            onClick={() => query?.fetch()}
            className="el-font-bold el-cursor-pointer"
          >
            here
          </span>{" "}
          to retry.
        </p>
      </DrawerEmpty>
    );
  } else if (!hasEntry) {
    return (
      <DrawerEmpty>
        <p>
          This directory is empty.
          <br />
          Click{" "}
          <span
            onClick={() => {
              context?.setNewEntry?.({ parent: root, type: "file" });
            }}
            className="el-font-bold el-cursor-pointer"
          >
            here
          </span>{" "}
          button to create a new file.
        </p>
      </DrawerEmpty>
    );
  } else {
    return (
      <div
        ref={dropRef}
        className={cx("el-w-full el-h-full", {
          "el-bg-pm/10": dropProps.isDropTarget,
        })}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const options = context?.handleContextMenu?.({ file: root, context });
          if (options?.length) {
            shell.showContextMenu({
              options,
              position: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }
        }}
      >
        <ScrollArea scrollY containerClassName="el-px-2 el-pb-2">
          <FileTreeEntries file={root} />
        </ScrollArea>
      </div>
    );
  }
}

export function WorkspaceDirectoryDrawer({
  root,
}: {
  root: File;
}): JSX.Element {
  const context = useWorkspaceFileTreeContext({ directory: root });

  return (
    <FileTreeContextProvider {...context}>
      <WorkspaceDirectoryTreeActions root={root} />
      <WorkspaceDirectoryDrawerContent root={root} />
    </FileTreeContextProvider>
  );
}
