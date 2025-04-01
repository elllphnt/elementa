import { File } from "@repo/backend";
import {
  ContextMenuOption,
  elllIcons16,
  useControlMenu,
} from "@repo/components";
import { jsonEditor } from "~/src/editors/monaco/json";
import { useElll } from "~/src/hooks/elll/elll";
import { getEditorForFileType } from "~/src/libs/filetypes";
import { initFile } from "~/src/libs/init_file";
import { keys } from "~/src/libs/keys";
import { FileTreeContextType } from "../file_tree/_contexts";

export const workpsaceDirectoryTreeFileTypes = [
  { icon: elllIcons16.component, type: "component", name: "Component" },
  { icon: elllIcons16.primitive, type: "primitive", name: "Primitive" },
  { icon: elllIcons16.state, type: "state", name: "State" },
  { icon: elllIcons16.context, type: "context", name: "Context" },
];

export function useWorkspaceFileTreeContext({
  directory,
}: {
  directory: File;
}): Partial<FileTreeContextType> {
  const elll = useElll();
  const { openMenu } = useControlMenu();
  return {
    handleNewEntry: async ({ name, parent, type }) => {
      const newFile = await parent.createEntry({ name, type });
      if (!newFile) {
        return "Failed to create file";
      }

      if (type !== "directory") {
        await initFile(elll, newFile);
      }
    },
    handleContextMenu: ({ file, context }) => {
      const options: ContextMenuOption[][] = [];

      if (file.isDirectory) {
        const fileCreationOptions: ContextMenuOption[] = [
          {
            label: `New file`,
            submenu: [
              workpsaceDirectoryTreeFileTypes.map(({ type, icon, name }) => ({
                label: name,
                icon,
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
          {
            label: "Generate With AI",
            action: () => {
              openMenu({
                title: "Generate With AI",
                viewId: keys.views.modals.generateFilesWithAi,
                props: {
                  path: file.path,
                },
              });
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

      return options;
    },
    handleClick: ({ file }) => {
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
    },
    hiddenPattern: /^\./,
  };
}
