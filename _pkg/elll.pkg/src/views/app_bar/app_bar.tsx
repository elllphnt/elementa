import {
  IconButton,
  Tooltip,
  elllIcons16,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import Logo from "~/src/components/modules/elll/logo";
import { useRepository } from "~/src/hooks/backend/repository";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { useElll } from "~/src/hooks/elll/elll";
import { modalViews } from "../modals/_";

function ProjectButton() {
  const { openMenu } = useControlMenu();
  const repository = useRepository();
  const name = useObservable(repository?.name$, repository?.name);

  if (!repository) {
    return <></>;
  }

  return (
    <button
      className="el-font-semibold el-text-fg-400 hover:el-text-fg-500 el-transition-colors"
      onClick={(e) =>
        openMenu({
          title: "Project",
          anchor: e.currentTarget,
          viewId: modalViews.project.id,
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
    <Tooltip content="Export" side="bottom" sideOffset={4} delayDuration={0}>
      <IconButton
        icon={elllIcons16.export}
        onClick={(e) =>
          openMenu({
            title: "Export",
            anchor: e.currentTarget,
            viewId: modalViews.export.id,
          })
        }
      />
    </Tooltip>
  );
}

function UserButton() {
  const { openMenu } = useControlMenu();

  return (
    <Tooltip content="Account" side="bottom" sideOffset={4} delayDuration={0}>
      <IconButton
        icon={elllIcons16.activityUser}
        onClick={(e) =>
          openMenu({
            title: "Account",
            anchor: e.currentTarget,
            viewId: modalViews.account.id,
          })
        }
      />
    </Tooltip>
  );
}

function ElllButton() {
  const elll = useElll();

  return (
    <button
      className="el-text-fg-400 hover:el-text-fg-500 el-transition-colors"
      onClick={() => elll.host.closeProject()}
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
        {workspace && <ProjectButton />}
      </div>
      <div className="el-h-full el-flex el-items-center el-justify-end el-gap-2">
        {workspace && <PublishButton />}
        <UserButton />
      </div>
    </div>
  );
}
