import { File } from "@repo/backend";
import { elllIcons16, useAction } from "@repo/components";
import { useContext } from "react";
import FileIcon from "../../icons/file_icon";
import { FileTreeContext } from "../../trees/file_tree/_contexts";
import { workpsaceDirectoryTreeFileTypes } from "./_context";

export function WorkspaceDirectoryTreeActions({ root }: { root: File }) {
  const context = useContext(FileTreeContext);

  useAction({
    title:
      workpsaceDirectoryTreeFileTypes.length === 1
        ? workpsaceDirectoryTreeFileTypes[0].name
        : "New file",
    icon: elllIcons16.plus,
    handler:
      workpsaceDirectoryTreeFileTypes.length === 1
        ? () => {
            context?.setNewEntry?.({
              parent: root,
              type: workpsaceDirectoryTreeFileTypes[0].type,
            });
          }
        : undefined,
    options:
      workpsaceDirectoryTreeFileTypes.length > 1
        ? workpsaceDirectoryTreeFileTypes.map(({ type, name }) => ({
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
