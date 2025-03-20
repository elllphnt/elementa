import { File } from "@repo/backend";
import {
  ScrollAreaContext,
  StatefulInput,
  TreeEntry,
  TreeIndent,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { memo, useContext, useEffect, useMemo, useRef } from "react";
import { map, of, switchMap } from "rxjs";
import { ModelEditorState } from "~/src/editors/model";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { Model } from "~/src/modules/elll/model/model";
import FileIcon from "../../icons/file_icon";
import { FileTreeContext } from "./_contexts";
import { useFileDrag, useFileDrop } from "./_hooks";
import { FileTreeEntries } from "./file_tree_entries";

export const FileTree = memo(function FileTree({
  file,
}: {
  file: File;
}): JSX.Element {
  const headRef = useRef<HTMLDivElement>(null);
  const shell = useShell();
  const context = useContext(FileTreeContext);
  const stateKey = [...(context?.stateKey ?? []), file.id];
  const [_isActive$, _isActive] = useMemo(() => {
    const isActive$ = shell.workspace$.pipe(
      switchMap((workspace) => workspace?.activeEditor$ ?? of(undefined)),
      switchMap((editor) =>
        editor instanceof ModelEditorState
          ? editor.model$.pipe(
              map(
                (model: Model | undefined) => model?.content?.url === file.url,
              ),
            )
          : of(false),
      ),
    );
    const isActive =
      shell.workspace?.activeEditor instanceof ModelEditorState &&
      shell.workspace.activeEditor.model?.content?.url === file.url;
    return [isActive$, isActive];
  }, [shell, file]);
  const isActive = useObservable(_isActive$, _isActive);
  const { setFocus } = useContext(ScrollAreaContext);

  const name = useObservable(file.name$, file.name);
  const isDirectory = useObservable(file.isDirectory$, file.isDirectory);
  const [open, setOpen] = useWorkspaceState<boolean>(
    [...stateKey, "open"],
    false,
  );
  const entriesQuery = file.entries();
  const deleting = useObservable(file.deleting$, file.deleting);
  const fetching = useObservable(entriesQuery.fetching$, entriesQuery.fetching);

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === file &&
    context?.newEntry?.type !== "directory";
  const hasNewEntry = hasDirectoryNewEntry || hasFileNewEntry;
  const isRenaming = context?.renameEntry?.file === file;

  // open on new entry
  useEffect(() => {
    if (hasNewEntry && !open) {
      setOpen(true);
    }
  }, [open, hasNewEntry]);

  // focus on active
  useEffect(() => {
    if (isActive && headRef.current) {
      setFocus?.(headRef.current);
    }
  }, [isActive]);

  // open when containing active
  // useEffect(() => {
  //   const activePath$ = shell.workspace$.pipe(
  //     switchMap((workspace) => workspace.activeEditor$),
  //     switchMap((editor) =>
  //       editor instanceof ContentEditorState
  //         ? editor.content$.pipe(map((content) => content))
  //         : of(undefined),
  //     ),
  //     switchMap((activeFile) => activeFile?.path$ ?? of(undefined)),
  //     distinctUntilChanged(),
  //   );
  //   const activeSubscription = activePath$.subscribe((activePath) => {
  //     if (file.path && activePath?.startsWith(file.path)) {
  //       setOpen(true);
  //     }
  //   });

  //   return () => {
  //     activeSubscription.unsubscribe();
  //   };
  // }, []);

  // Event handlers

  function handleClick() {
    if (file.isDirectory) {
      setOpen(!open);
    } else {
      context?.handleClick?.({ file });
    }
  }
  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const options = context?.handleContextMenu?.({ file, context });
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
  function handleDoubleClick() {
    context?.handleDoubleClick?.({ file });
  }

  const [dragRef] = useFileDrag(file);
  const [dropRef, dropProps] = useFileDrop(file);

  // head content

  let head = <></>;

  if (isRenaming) {
    head = (
      <StatefulInput
        value={name}
        style={{
          width: "100%",
          outline: "none",
          background: "transparent",
          border: "none",
          font: "inherit",
        }}
        onChange={(e) => file.setName(e.target.value)}
        onBlur={() => context?.setRenameEntry?.(undefined)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        autoFocus
      />
    );
  } else {
    head = <>{name}</>;
  }

  return (
    <div
      ref={(e) => {
        dragRef(e);
        dropRef(e);
      }}
      className={cx("el-space-y-0.5 el-rounded el-transition-colors", {
        "el-bg-pm/10": dropProps.isDropTarget,
      })}
    >
      <TreeEntry
        nested
        ref={headRef}
        active={isActive}
        container={isDirectory}
        open={open}
        onToggleOpen={setOpen}
        icon={<FileIcon file={file} open={open} />}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        loading={deleting || fetching}
      >
        {head}
      </TreeEntry>

      {open ? (
        <TreeIndent>
          <FileTreeEntries key={file.id} file={file} />
        </TreeIndent>
      ) : (
        <></>
      )}
    </div>
  );
});
