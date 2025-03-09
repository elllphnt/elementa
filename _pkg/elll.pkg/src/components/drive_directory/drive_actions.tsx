import { File } from "@repo/backend";
import { elllIcons16, useAction } from "@repo/components";
import { useContext } from "react";
import { FileTreeContext } from "~/src/components/file_tree/_contexts";

export function DriveActions({ root }: { root: File }): JSX.Element {
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
