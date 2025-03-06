import { Workspace } from "@repo/backend";
import {
  elllIcons16,
  ElllPlaceholder,
  Icon,
  TreeEntry,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useElll } from "~/src/hooks/elll/elll";
import QueryInput from "./query_input";

export function WorkspaceBoardPlaceholderView({}: {
  workspace: Workspace;
}): JSX.Element {
  return <ElllPlaceholder />;
}

function NewWorkspaceButton() {
  const elll = useElll();
  const tenant = useObservable(elll.tenant$, elll.tenant);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!tenant) {
      console.error("No tenant found", elll.tenantId);
      return;
    }

    setIsCreating(true);
    try {
      const workspace = await tenant.createWorkspace({ name: "New Workspace" });
      if (!workspace) return;
      elll.host.openWorkspace(workspace.id);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.plus} />}
      onClick={handleCreate}
      loading={isCreating}
    >
      New Workspace
    </TreeEntry>
  );
}

function StartSection() {
  return (
    <div className="el-space-y-2">
      <p className="el-text-lg">Start</p>
      <div className="el-space-y-1">
        <NewWorkspaceButton />
      </div>
    </div>
  );
}

function RecentSection() {
  const elll = useElll();
  const tenant = useObservable(elll.tenant$, elll.tenant);
  const workspaceQuery = tenant?.workspaces({ autoFetch: true });
  const workspaces = useObservable(workspaceQuery?.data$, workspaceQuery?.data);

  if (!workspaces?.length) {
    return <></>;
  }

  return (
    <div className="el-space-y-1">
      <p className="el-text-lg">Workspaces</p>
      <div className="el-space-y-1">
        {workspaces.map((workspace) => (
          <TreeEntry
            icon={<Icon name={elllIcons16.workspace} />}
            key={workspace.id}
            onClick={() => elll.host.openWorkspace(workspace.id)}
          >
            {workspace.name}
          </TreeEntry>
        ))}
      </div>
    </div>
  );
}

export function ElllBoardPlaceholderView(): JSX.Element {
  return (
    <div
      style={{
        pointerEvents: "auto",
      }}
      className="el-flex-1 el-p-8 el-flex el-flex-col el-items-center el-justify-center"
    >
      <div
        className="el-w-full el-max-w-4xl el-gap-12 el-flex"
        style={{
          minHeight: 360,
        }}
      >
        <div className="el-flex el-flex-col el-w-[280px] el-space-y-8">
          <StartSection />
          <RecentSection />
        </div>

        <div className="el-w-full el-flex el-flex-col el-gap-4">
          <h1 className="el-text-2xl el-font-bold">
            What can I help you build?
          </h1>
          <QueryInput />
        </div>
      </div>
    </div>
  );
}

export function BoardPlaceholderView(): JSX.Element {
  const elll = useElll();
  const workspace = useObservable(elll.workspace$, elll.workspace);

  if (workspace) {
    return <WorkspaceBoardPlaceholderView workspace={workspace} />;
  } else {
    return <ElllBoardPlaceholderView />;
  }
}
