import { Drive, File } from "@repo/backend";
import {
  ContextMenuOption,
  elllIcons16,
  useAction,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useContext } from "react";
import { DrawerLoader } from "../../../components/drawer_loader";
import {
  FileTreeContext,
  HandleClick,
  HandleContextMenu,
  HandleNewEntry,
} from "../../../components/file_tree/_contexts";
import { FileTreeContextProvider } from "../../../components/file_tree/file_tree_context_provider";
import { HeadlessFileTree } from "../../../components/file_tree/headless_file_tree";
import { useDriveFileAtPath } from "../../../hooks/backend/drive";
import { useElll } from "../../../hooks/elll/elll";
import { modalViews } from "../../modals/_";

function Actions({
  root,
  onCreateDriveFile,
}: {
  root: File;
  onCreateDriveFile: () => void;
}) {
  const { openMenu } = useControlMenu();
  const context = useContext(FileTreeContext);

  useAction({
    title: "New file",
    icon: elllIcons16.plus,
    handler: onCreateDriveFile,
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

export function DriveTreeEntries({ drive }: { drive: Drive }): JSX.Element {
  const elll = useElll();
  const [directory, query] = useDriveFileAtPath(drive, "", {
    type: "directory",
  });
  const fetching = useObservable(query?.fetching$, query?.fetching);
  const { openMenu } = useControlMenu();

  if (fetching) {
    return <DrawerLoader />;
  }

  if (!directory) {
    return (
      <div className="el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg el-p-3">
        Directory not found
        <div className="font-mono">/</div>
      </div>
    );
  }

  const handleNewEntry: HandleNewEntry = async ({ name, parent, type }) => {
    const newFile = await parent.createEntry({ name, type });
  };
  const handleContextMenu: HandleContextMenu = ({ file, context }) => {
    const options: ContextMenuOption[][] = [];

    if (file.isDirectory) {
      const fileCreationOptions: ContextMenuOption[] = [
        {
          label: "New file",
          action: () => {},
        },
        {
          label: "New directory",
          action: () => {
            context?.setNewEntry?.({ parent: file, type: "directory" });
          },
        },
      ];

      options.push(fileCreationOptions);
    }

    const fileManipulationOptions: ContextMenuOption[] = [
      {
        label: "Rename",
        action: () => {
          context?.setRenameEntry?.({ file });
        },
      },
      {
        label: "Delete",
        action: async () => {
          await file.delete();
        },
      },
    ];

    options.push(fileManipulationOptions);

    return options;
  };
  const handleClick: HandleClick = ({ file }) => {
    if (!file.isDirectory) {
      openMenu({
        title: file.name,
        viewId: modalViews.driveFile.id,
        props: {
          drive,
          file,
        },
      });
    }
  };
  const handleCreateDriveFile = () => {
    openMenu({
      title: "New drive file",
      viewId: modalViews.createDriveFile.id,
      props: {
        drive,
        directory,
      },
    });
  };

  return (
    <FileTreeContextProvider
      handleNewEntry={handleNewEntry}
      handleContextMenu={handleContextMenu}
      handleClick={handleClick}
    >
      <Actions root={directory} onCreateDriveFile={handleCreateDriveFile} />
      <HeadlessFileTree file={directory} fitContent />
    </FileTreeContextProvider>
  );
}
