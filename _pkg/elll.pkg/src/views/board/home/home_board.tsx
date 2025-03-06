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
import { keys } from "~/src/libs/keys";
import { ElllElementaProject } from "~/src/modules/elementa/project/project";
import { RepositoryHistory } from "~/src/modules/elll/history";
import { modalViews } from "../../modals/_";
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
      console.error("No tenant found");
      return;
    }

    setIsCreating(true);
    try {
      const repository = await tenant.createRepository({
        name: "New Project",
        type: "component-library",
      });
      if (!repository) return;
      // open project
      elll.host.openProject(repository.id);

      const key = elll.shell.showNotification({
        title: "Initializing project",
        message: "Generating project features...",
        progress: true,
      });

      // set project description
      const project = elll.config<ElllElementaProject>(
        keys.configs.editors.elementa.project,
      );
      if (!project) {
        throw new Error("Project not found");
      }

      // await firstValueFrom(
      //   project.variableManager.loaded$.pipe(filter(Boolean), timeout(5000)),
      // );
      // await firstValueFrom(
      //   project.utilityManager.loaded$.pipe(filter(Boolean), timeout(5000)),
      // );

      // const { variables, utilities } = generateTailwindStylePreset();
      // project.variableManager.restore({ sets: variables });
      // project.utilityManager.restore({ sets: utilities });
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
      Start from scratch
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
            What can I help you build?
          </h1>
          <QueryInput />

          {/* <button
            onClick={() =>
              shell.showNotification({
                title: "Workspace Successfully Initialized",
                message: (
                  <div className="el-space-y-1">
                    <p>
                      Your project workspace has been set up, and a project
                      description along with a list of features has been
                      generated based on your initial prompt.
                    </p>
                    <p className="el-font-semibold el-text-lg el-text-fg el-mb-1">
                      What's Next?
                    </p>
                    <ol className="el-list-decimal el-space-y-1">
                      <li>
                        <span className="el-font-semibold el-text-fg">
                          Adjust Features
                        </span>
                        : Review and customize the features to better match your
                        project requirements.
                      </li>
                      <li>
                        <span className="el-font-semibold el-text-fg">
                          Generate Your Project
                        </span>
                        : Once you're satisfied with the adjustments, click the{" "}
                        <span className="el-font-semibold el-text-fg">
                          "Generate Project"
                        </span>{" "}
                        button to create your project implementation.
                      </li>
                    </ol>
                  </div>
                ),
                actions: [
                  {
                    label: "Thanks!",
                    handler: () => {
                      console.log("Thanks!");
                    },
                    primary: true,
                  },
                ],
              })
            }
          >
            Notify
          </button> */}
        </div>
      </div>
    </div>
  );
}
