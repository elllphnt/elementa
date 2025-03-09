import { Drive } from "@repo/backend";
import {
  ActionRegistry,
  ActionRegistryContext,
  Icon,
  TreeEntry,
  TreeIndent,
  elllIcons16,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useMemo } from "react";
import { useWorkspaceState } from "../../../hooks/workspace";
import { modalViews } from "../../modals/_";
import { DriveTreeEntries } from "./drive_tree";

export function DriveTree({
  drive,
  stateKey,
}: {
  drive: Drive;
  stateKey: string[];
}) {
  const shell = useShell();
  const name = useObservable(drive.name$, drive.name);
  const actionRegistry = useMemo(() => new ActionRegistry(), []);
  const actions = useObservable(
    actionRegistry.actions$,
    actionRegistry.actions,
  );
  const [open, setOpen] = useWorkspaceState([...stateKey, "open"], false);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    shell.showContextMenu({
      options: [
        [
          {
            label: "Delete Drive",
            action: () => {
              shell.showModal({
                affinity: "workspace",
                viewId: modalViews.deleteDrive.id,
                closeOnBackdropClick: true,
                props: {
                  drive,
                  onComplete: () => {
                    shell.hideModal();
                  },
                },
              });
            },
          },
        ],
      ],
      position: { x: event.clientX, y: event.clientY },
    });
  };

  return (
    <div>
      <TreeEntry
        nested
        container
        open={open}
        onToggleOpen={setOpen}
        icon={<Icon name={elllIcons16.drive} />}
        actions={actions.map((action) => ({
          icon: <Icon name={action.icon} />,
          handler: action.handler,
        }))}
        onClick={() => {
          setOpen(!open);
        }}
        onContextMenu={handleContextMenu}
      >
        {name}
      </TreeEntry>
      {open ? (
        <ActionRegistryContext.Provider value={actionRegistry}>
          <TreeIndent>
            <DriveTreeEntries drive={drive} />
          </TreeIndent>
        </ActionRegistryContext.Provider>
      ) : null}
    </div>
  );
}
