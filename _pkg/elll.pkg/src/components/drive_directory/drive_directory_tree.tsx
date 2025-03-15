import { DriveFile, File } from "@repo/backend";
import { FileTreeContextProvider } from "~/src/components/file_tree/file_tree_context_provider";
import { DriveDirectoryTreeContent } from "./drive_directory_tree_content";

interface DriveDirectoryTreeProps {
  directory: File;
  hidden?: RegExp;
  contextMenuOptions?: (file: File, context?: any) => any[][];
}

export function DriveDirectoryTree({
  directory,
  hidden,
  contextMenuOptions,
}: DriveDirectoryTreeProps): JSX.Element {
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

  return (
    <FileTreeContextProvider
      handleNewEntry={handleNewEntry}
      handleContextMenu={handleContextMenu}
      handleClick={handleClick}
      hidden={hidden}
    >
      <DriveDirectoryTreeContent directory={directory} />
    </FileTreeContextProvider>
  );
}
