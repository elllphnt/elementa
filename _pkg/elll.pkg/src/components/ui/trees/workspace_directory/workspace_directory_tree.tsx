import { File } from "@repo/backend";
import { ContextMenuOption, elllIcons16, useAction } from "@repo/components";
import { useContext } from "react";
import { jsonEditor } from "~/src/editors/monaco/json";
import { getEditorForFileType } from "~/src/libs/filetypes";
import { initFile } from "~/src/libs/init_file";
import FileIcon from "../../icons/file_icon";
import {
  FileTreeContext,
  FileTreeContextType,
  HandleClick,
  HandleContextMenu,
  HandleNewEntry,
} from "../file_tree/_contexts";
import { useSortedFileTreeEntries } from "../file_tree/_hooks";
import { FileTree } from "../file_tree/file_tree";
import { FileTreeContextProvider } from "../file_tree/file_tree_context_provider";
import { FileTreeNewEntry } from "../file_tree/new_entry";
import { useElll } from "~/src/hooks/elll/elll";

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
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden: context?.hidden,
  });

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type !== "directory";

  return (
    <>
      <Actions root={directory} fileTypes={fileTypes} />
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
  const elll = useElll();
  const handleNewEntry: HandleNewEntry = async ({ name, parent, type }) => {
    const newFile = await parent.createEntry({ name, type });
    if (!newFile) {
      return "Failed to create file";
    }

    if (type !== "directory") {
      await initFile(elll, newFile);
    }
  };
  const handleContextMenu: HandleContextMenu = ({ file, context }) => {
    const options: ContextMenuOption[][] = [];

    if (file.isDirectory) {
      const fileCreationOptions: ContextMenuOption[] = [
        {
          label: `New file`,
          submenu: [
            fileTypes.map(({ type, name }) => ({
              label: name,
              icon: <FileIcon type={type} />,
              action: () => {
                context?.setNewEntry?.({ parent: file, type });
              },
            })),
          ],
        },
        {
          label: "New Directory",
          action: () => {
            context?.setNewEntry?.({ parent: file, type: "directory" });
          },
        },
      ];

      options.push(fileCreationOptions);
    } else {
      options.push([
        {
          label: "Open as JSON",
          action: () => {
            elll.editorManager.openModel(jsonEditor.id, file.url);
          },
        },
      ]);
    }

    if (file !== directory) {
      const fileManipulationOptions: ContextMenuOption[] = [
        {
          label: "Rename",
          action: () => {
            context?.setRenameEntry?.({ file });
          },
        },
        {
          label: "Duplicate",
          action: async () => {
            const newFile = await file.duplicate();
            if (!newFile) {
              return elll.shell.toast({
                message: "Failed to duplicate file",
              });
            }
            // elll.editorManager.openFile(newFile.url);
          },
        },
        {
          label: "Delete",
          action: async () => {
            await file.delete();
          },
        },
      ];
      const fileInfoOptions: ContextMenuOption[] = [
        {
          label: "Copy Id",
          action: () => {
            navigator.clipboard.writeText(file.id);
            elll.shell.toast({ message: "Copied file id to clipboard" });
          },
        },
        {
          label: "Copy Path",
          action: () => {
            if (file.path) {
              navigator.clipboard.writeText(file.path);
              elll.shell.toast({ message: "Copied file path to clipboard" });
            } else {
              elll.shell.toast({ message: "File path not loaded" });
            }
          },
        },
      ];

      options.push(fileManipulationOptions, fileInfoOptions);
    }

    const customOptions = contextMenuOptions?.(file, context);
    if (customOptions?.length) {
      options.push(...customOptions);
    }

    return options;
  };
  const handleClick: HandleClick = ({ file }) => {
    if (file.isDirectory) {
      return;
    }
    file.untilLoaded().then(() => {
      const type = file.type;
      if (!type) {
        elll.shell.toast({
          message: `Unable to determine file type for ${file.name}.`,
        });
        return;
      }
      const editor = getEditorForFileType(type);
      if (!editor) {
        elll.shell.toast({
          message: `No editor available for ${file.name}.`,
        });
        return;
      }
      elll.editorManager.openModel(editor, file.url);
    });
  };

  return (
    <FileTreeContextProvider
      handleNewEntry={handleNewEntry}
      handleContextMenu={handleContextMenu}
      handleClick={handleClick}
      defaultFileType={defaultFileType}
      defaultFileTypeName={defaultFileTypeName}
      hidden={hidden}
    >
      <WorkspaceDirectoryTreeContent
        directory={directory}
        fileTypes={fileTypes}
      />
    </FileTreeContextProvider>
  );
}
