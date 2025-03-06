import { Icon, elllIcons16, useControlMenu } from "@repo/components";
import { useObservable } from "@repo/utils";
import Logo from "~/src/components/logo";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { useElll } from "~/src/hooks/elll/elll";
import { modalViews } from "../modals/_";

function WorkspaceButton() {
  const { openMenu } = useControlMenu();
  const workspace = useWorkspace();
  const name = useObservable(workspace?.name$, workspace?.name);

  if (!workspace) {
    return <></>;
  }

  return (
    <button
      className="el-font-semibold el-text-fg-400 hover:el-text-fg-500 el-transition-colors"
      onClick={(e) =>
        openMenu({
          title: "Workspace",
          anchor: e.currentTarget,
          viewId: modalViews.workspaceInfo.id,
        })
      }
    >
      {name || <span className="el-text-fg-300">Untitled Project</span>}
    </button>
  );
}

function PublishButton() {
  const { openMenu } = useControlMenu();

  return (
    <button
      className="el-font-semibold el-flex el-gap-1 el-items-center el-justify-center el-text-fg-400 hover:el-text-fg hover:el-bg-fg/10 el-h-5 el-w-5 el-rounded el-transition-colors"
      onClick={(e) =>
        openMenu({
          title: "Export",
          anchor: e.currentTarget,
          viewId: modalViews.export.id,
        })
      }
    >
      <Icon
        className="el-h-4 el-w-4 el-relative top-0.5"
        name={elllIcons16.export}
      />
    </button>
  );
}

function UserButton() {
  const { openMenu } = useControlMenu();

  return (
    <button
      className="el-font-semibold el-flex el-gap-1 el-items-center el-justify-center el-text-fg-400 hover:el-text-fg hover:el-bg-fg/10 el-h-5 el-w-5 el-rounded el-transition-colors"
      onClick={(e) =>
        openMenu({
          title: "Account",
          anchor: e.currentTarget,
          viewId: modalViews.account.id,
        })
      }
    >
      <Icon
        className="el-h-4 el-w-4 el-relative top-0.5"
        name={elllIcons16.activityUser}
      />
    </button>
  );
}

function ElllButton() {
  const elll = useElll();

  return (
    <button
      className="el-text-fg-400 hover:el-text-fg-500 el-transition-colors"
      onClick={() => elll.host.closeWorkspace()}
    >
      <Logo height={12} />
    </button>
  );
}

export function AppBarView(): JSX.Element {
  const workspace = useWorkspace();

  return (
    <div className="el-h-full el-w-full el-flex el-p-2 el-justify-between el-items-center">
      <div className="el-h-full el-flex el-items-center el-shrink-0">
        <ElllButton />
      </div>
      <div className="el-h-full el-flex el-items-center el-shrink-0">
        {workspace && <WorkspaceButton />}
      </div>
      <div className="el-h-full el-flex el-items-center el-justify-end el-gap-2">
        {workspace && <PublishButton />}
        <UserButton />
      </div>
    </div>
  );
}
