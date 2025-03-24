import { makeFileId, parseEntityId } from "@elllphnt/utils";
import { Icon, TreeEntry, elllIcons16 } from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import FileIcon from "~/src/components/ui/icons/file_icon";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElll } from "~/src/hooks/elll/elll";
import { getEditorForFileType } from "~/src/libs/filetypes";
import { nameFromPath } from "~/src/modules/elementa/_utils";
import { useWorkspace } from "../../../hooks/backend/workspace";

export function WorkspaceChangeEntry({ change }: { change: any }): JSX.Element {
  if (change.deleted) {
    return <NegativeWorkspaceChangeEntry change={change} />;
  } else {
    return <PositiveWorkspaceChangeEntry change={change} />;
  }
}

function PositiveWorkspaceChangeEntry({
  change,
}: {
  change: any;
}): JSX.Element {
  const elll = useElll();
  const repository = useRepository();
  const workspace = useWorkspace();
  const [reseting, setReseting] = useState<boolean>(false);

  const bareDriveId = workspace
    ? parseEntityId(workspace.id)?.bare_id
    : undefined;
  const file_id = bareDriveId
    ? makeFileId({
        entity: "workspace_file",
        bare_drive_id: bareDriveId,
        bare_file_id: change.id,
      })
    : "";

  const file = file_id ? workspace?.file(file_id, true) : undefined;
  const path = useObservable(file?.path$, file?.path);
  const type = useObservable(file?.type$, file?.type);
  const name = nameFromPath(path ?? "");

  const directory = path?.split("/").slice(0, -1).join("/");

  let icon = "";
  let color = "";
  let actions = [] as string[];

  if (change.created) {
    icon = elllIcons16.plus;
    color = "green";
    actions.push("created");
  }
  if (change.modified) {
    icon = elllIcons16.content;
    color = "yellow";
    actions.push("modified");
  }
  if (change.moved) {
    icon = elllIcons16.move;
    color = "cyan";
    actions.push(`moved`);
  }

  const title = actions.join(", ") + ` • ${path}`;

  return (
    <TreeEntry
      title={title}
      icon={<FileIcon type={type} />}
      suffix={<Icon className="el-h-4 el-w-4" name={icon} color={color} />}
      onClick={() => {
        if (!file) return;
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
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.undo} />,
          handler: async () => {
            if (!file_id) return;
            try {
              setReseting(true);
              await repository?.resetWorkspace({
                file_ids: [file_id],
              });
            } catch (err) {
              console.error(err);
              elll.shell.toast({
                message: "Failed to reset changes.",
              });
            } finally {
              setReseting(false);
            }
          },
        },
      ]}
      loading={reseting}
    >
      {name} <span className="el-text-fg-300 el-text-sm">{directory}</span>
    </TreeEntry>
  );
}

function NegativeWorkspaceChangeEntry({
  change,
}: {
  change: any;
}): JSX.Element {
  const shell = useShell();
  const repository = useRepository();
  const headCommit = useObservable(
    repository?.headCommit$,
    repository?.headCommit,
  );

  const bareDriveId = headCommit
    ? parseEntityId(headCommit.id)?.bare_id
    : undefined;
  const file_id = bareDriveId
    ? makeFileId({
        entity: "commit_file",
        bare_drive_id: bareDriveId,
        bare_file_id: change.id,
      })
    : "";
  const file = file_id ? headCommit?.file(file_id, true) : undefined;

  const path = useObservable(file?.path$, file?.path);
  const type = useObservable(file?.type$, file?.type);

  const name = nameFromPath(path ?? "");
  const directory = path?.split("/").slice(0, -1).join("/");
  const title = `deleted • ${path}`;

  return (
    <TreeEntry
      title={title}
      icon={<FileIcon type={type} />}
      suffix={
        <Icon className="el-h-4 el-w-4" name={elllIcons16.minus} color="red" />
      }
      onClick={() => {
        shell.toast({
          message: "This file was deleted.",
        });
      }}
    >
      {name} <span className="el-text-fg-300 el-text-sm">{directory}</span>
    </TreeEntry>
  );
}
