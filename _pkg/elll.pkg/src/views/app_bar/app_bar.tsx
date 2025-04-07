import {
  Icon,
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
import { keys } from "~/src/libs/keys";
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
    <button
      onClick={(e) =>
        openMenu({
          title: "Export",
          anchor: e.currentTarget,
          viewId: modalViews.export.id,
        })
      }
      className="el-flex el-gap-2 el-items-center el-h-5 el-bg-pm/80 el-pl-2 el-pr-1 el-text-pm-ctr el-text-fg-100 hover:el-bg-pm el-transition-colors el-text-sm el-rounded"
    >
      <div
        style={{
          position: "relative",
          top: 1,
        }}
      >
        Export
      </div>
      <Icon name={elllIcons16.export} />
    </button>
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

function CopilotButton() {
  const { openMenu } = useControlMenu();

  return (
    <Tooltip content="Copilot" side="bottom" sideOffset={4} delayDuration={0}>
      <IconButton
        icon={elllIcons16.ai}
        onClick={(e) =>
          openMenu({
            title: "Copilot",
            anchor: e.currentTarget,
            viewId: keys.views.modals.copilot,
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
    <div className="el-h-full el-w-full el-flex el-px-2 el-justify-between el-items-center">
      <div className="el-h-full el-w-1/3 el-shrink-0 el-flex el-items-center">
        <ElllButton />
      </div>
      <div className="el-h-full el-w-1/3 el-shrink-0 el-flex el-items-center el-justify-center">
        {workspace && <ProjectButton />}
      </div>
      <div className="el-h-full el-w-1/3 el-shrink-0 el-flex el-items-center el-justify-end el-gap-2">
        {workspace && <CopilotButton />}
        {workspace && <PublishButton />}
        <UserButton />
      </div>
    </div>
  );
}
