import { File } from "@repo/backend";
import {
  ContextMenuOption,
  ProgressBar,
  ScrollArea,
  elllIcons16,
  useAction,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useContext } from "react";
import { useWorkspaceFileAtPath } from "../hooks/backend/file";
import { useElll } from "../hooks/elll/elll";
import { initFileContent } from "../libs/constants/file_inits";
import FileIcon from "./file_icon";
import {
  FileTreeContext,
  FileTreeContextType,
  HandleClick,
  HandleContextMenu,
  HandleNewEntry,
} from "./file_tree/_contexts";
import { FileTreeContextProvider } from "./file_tree/file_tree_context_provider";
import { HeadlessFileTree } from "./file_tree/headless_file_tree";

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

export function WorkspaceDirectoryView({
  path,
  fileTypes = [],
  defaultFileType,
  defaultFileTypeName,
  extraEntries,
  contextMenuOptions,
}: {
  path: string;
  fileTypes?: Array<{
    type: string;
    name: string;
  }>;
  defaultFileType: string;
  defaultFileTypeName: string;
  extraEntries?: React.ReactNode;
  contextMenuOptions?: (
    file: File,
    context?: FileTreeContextType,
  ) => ContextMenuOption[][];
}): JSX.Element {
  const elll = useElll();
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

  const handleNewEntry: HandleNewEntry = async ({ name, parent, type }) => {
    const newFile = await parent.createEntry({ name, type });
    if (!newFile) {
      return "Failed to create file";
    }

    if (type !== "directory") {
      const content = initFileContent({ type, name, path, id: newFile.id });
      // if (content) {
      //   newFile.setContent(content);
      // }
      elll.editorManager.openFile(newFile.url);
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
            elll.editorManager.openFile(newFile.url);
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
    if (!file.isDirectory) {
      elll.editorManager.openFile(file.url);
    }
  };

  return (
    <ScrollArea
      scrollY
      containerClassName="el-px-2 el-pb-2 el-pt-1 el-flex el-flex-col"
    >
      <FileTreeContextProvider
        handleNewEntry={handleNewEntry}
        handleContextMenu={handleContextMenu}
        handleClick={handleClick}
        defaultFileType={defaultFileType}
        defaultFileTypeName={defaultFileTypeName}
      >
        <Actions root={directory} fileTypes={fileTypes} />
        <HeadlessFileTree file={directory} extraEntries={extraEntries} />
      </FileTreeContextProvider>
    </ScrollArea>
  );
}
