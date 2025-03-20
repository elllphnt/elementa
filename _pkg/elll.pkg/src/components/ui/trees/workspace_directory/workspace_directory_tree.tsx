import { File } from "@repo/backend";
import { ContextMenuOption, elllIcons16, useAction } from "@repo/components";
import { useContext } from "react";
import { jsonEditor } from "~/src/editors/monaco/json";
import { useElll } from "~/src/hooks/elll/elll";
import { getEditorForFileType } from "~/src/libs/filetypes";
import { initFile } from "~/src/libs/init_file";
import FileIcon from "../../icons/file_icon";
import {
  FileTreeContext,
  HandleClick,
  HandleContextMenu,
  HandleNewEntry,
} from "../file_tree/_contexts";
import { useSortedFileTreeEntries } from "../file_tree/_hooks";
import { FileTree } from "../file_tree/file_tree";
import { FileTreeContextProvider } from "../file_tree/file_tree_context_provider";
import { FileTreeNewEntry } from "../file_tree/new_entry";

const fileTypes = [
  { type: "component", name: "Component" },
  { type: "primitive", name: "Primitive" },
  { type: "state", name: "State" },
  { type: "context", name: "Context" },
];

function Actions({
  root,
  fileTypes = [],
}: {
  root: File;
  fileTypes?: Array<{
    type: string;
    name: string;
  }>;
}) {
  const context = useContext(FileTreeContext);

  useAction({
    title: fileTypes.length === 1 ? fileTypes[0].name : "New file",
    icon: elllIcons16.plus,
    handler:
      fileTypes.length === 1
        ? () => {
            context?.setNewEntry?.({ parent: root, type: fileTypes[0].type });
          }
        : undefined,
    options:
      fileTypes.length > 1
        ? fileTypes.map(({ type, name }) => ({
            icon: <FileIcon type={type} />,
            label: name,
            onClick: () => {
              context?.setNewEntry?.({ parent: root, type });
            },
          }))
        : undefined,
  });

  useAction({
    title: "New directory",
    icon: elllIcons16.directoryClosed,
    handler: () => {
      context?.setNewEntry?.({ parent: root, type: "directory" });
    },
  });

  useAction(
    {
      title: "Settings",
      icon: elllIcons16.properties,
      options: [
        {
          label: context?.showHidden
            ? "Hide hidden files"
            : "Show hidden files",
          onClick: () => {
            context?.setShowHidden?.(!context?.showHidden);
          },
        },
      ],
    },
    [context?.showHidden],
  );

  return <></>;
}

export function WorkspaceDirectoryTreeContent({
  directory,
  fileTypes = [],
}: {
  directory: File;
  fileTypes?: Array<{
    type: string;
    name: string;
  }>;
}): JSX.Element {
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory);

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type !== "directory";

  return (
    <>
      {hasDirectoryNewEntry && <FileTreeNewEntry />}
      {directoryEntries?.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
      {hasFileNewEntry && <FileTreeNewEntry />}
      {fileEntries?.map((entry) => <FileTree key={entry.id} file={entry} />)}
    </>
  );
}

export function WorkspaceDirectoryTree({
  directory,
}: {
  directory: File;
}): JSX.Element {
  return (
    <FileTreeContextProvider
      handleNewEntry={handleNewEntry}
      handleContextMenu={handleContextMenu}
      handleClick={handleClick}
      hiddenPattern={/^\./}
    >
      <WorkspaceDirectoryTreeContent
        directory={directory}
        fileTypes={fileTypes}
      />
    </FileTreeContextProvider>
  );
}
