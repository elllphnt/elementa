import { Repository, Workspace } from "@repo/backend";
import {
  elllIcons16,
  ElllPlaceholder,
  Icon,
  ProgressCircle,
  TreeEntry,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useElll } from "~/src/hooks/elll/elll";
import { configs } from "~/src/libs/configs";
import { RepositoryHistory } from "~/src/modules/elll/history";
import { modalViews } from "../../modals/_";
import QueryInput from "./query_input";

export function WorkspaceBoardPlaceholderView({}: {
  workspace: Workspace;
}): JSX.Element {
  return <ElllPlaceholder />;
}

function NewWorkspaceButton({
  type,
  label,
}: {
  type: "library" | "application";
  label: string;
}) {
  const elll = useElll();
  const tenant = useObservable(elll.tenant$, elll.tenant);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!tenant) {
      console.error("No tenant found");
      return;
    }

    setIsCreating(true);
    try {
      const repository = await tenant.createRepository({
        name: "New Project",
        type,
      });
      if (!repository) return;
      elll.host.openProject(repository.id);
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
      {label}
    </TreeEntry>
  );
}

function StartSection() {
  return (
    <div className="el-space-y-2">
      <p className="el-text-lg">Start from scratch</p>
      <div className="el-space-y-1">
        <NewWorkspaceButton type="application" label="New Web App" />
        <NewWorkspaceButton type="library" label="New UI Library" />
      </div>
    </div>
  );
}

function RepositoryEntry({ repository }: { repository: Repository }) {
  const elll = useElll();
  const name = useObservable(repository.name$, repository.name);

  return (
    <TreeEntry
      icon={<Icon name={elllIcons16.workspace} />}
      key={repository.id}
      onClick={() => elll.host.openProject(repository.id)}
    >
      {name}
    </TreeEntry>
  );
}

function RecentProjectList() {
  const elll = useElll();
  const history = elll.config<RepositoryHistory>(configs.elll.history);
  const tenant = useObservable(elll.tenant$, elll.tenant);
  const repositoryQuery = tenant?.repositories({ autoFetch: true });
  const repositories = useObservable(history?.recent$(5), history?.recent(5));
  const fetching = useObservable(
    repositoryQuery?.fetching$,
    repositoryQuery?.fetching,
  );
  const error = useObservable(repositoryQuery?.error$, repositoryQuery?.error);

  if (fetching || !tenant) {
    return (
      <div className="el-text-fg-300">
        <ProgressCircle inline /> Loading projects...
      </div>
    );
  } else if (!repositories?.length && error) {
    return (
      <div className="el-flex el-flex-col el-gap-2 el-items-start">
        <div className="el-text-fg-300">Failed to fetch projects</div>
        <button
          onClick={() => repositoryQuery?.fetch()}
          className="el-text-pm hover:el-text-pm-400"
        >
          Retry
        </button>
      </div>
    );
  } else if (!repositories?.length) {
    return <div className="el-text-fg-300">No project found</div>;
  }

  return (
    <div className="el-space-y-2">
      <p className="el-text-lg">Recent</p>
      <div className="el-space-y-1">
        {repositories.map((repository) => (
          <RepositoryEntry key={repository.id} repository={repository} />
        ))}
      </div>
    </div>
  );
}

function RecentSection() {
  return (
    <div className="el-space-y-2">
      <RecentProjectList />
    </div>
  );
}

export function HomeBoardView(): JSX.Element {
  const shell = useShell();
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
        <div
          className="el-flex el-flex-col el-space-y-8"
          style={{
            width: 200,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <StartSection />
          <RecentSection />

          <div>
            <button
              className="el-text-fg-400 hover:el-text-fg-500"
              onClick={() => {
                shell.showModal({
                  viewId: modalViews.projectList.id,
                  affinity: "workspace",
                  closeOnEscape: true,
                  closeOnBackdropClick: true,
                });
              }}
            >
              Show All Projects
            </button>
          </div>
        </div>

        <div className="el-w-full el-flex el-flex-col el-gap-4">
          <h1 className="el-text-2xl el-font-bold">
            What do you want to bring to life today?
          </h1>
          <QueryInput />
        </div>
      </div>
    </div>
  );
}
