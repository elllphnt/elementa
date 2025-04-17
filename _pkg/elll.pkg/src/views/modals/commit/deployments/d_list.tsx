import { Commit, Deployment, Environment } from "@repo/backend";
import { Icon, TreeEntry, elllIcons16, useAction } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useWorkspaceState } from "../../../../hooks/workspace";
import { StatusIndicator } from "../../../drawers/versions/status_indicator";
import { commitViewActiveDeploymentUrl } from "./_lib";

function DeploymentEntry({
  deployment,
  nested,
}: {
  deployment: Deployment;
  nested?: boolean;
}) {
  const status = useObservable(deployment.status$, deployment.status);
  const [activeDeployment, setActiveDeployment] = useWorkspaceState(
    commitViewActiveDeploymentUrl(deployment.commitId ?? ""),
  );

  return (
    <TreeEntry
      accent
      active={activeDeployment === deployment.url}
      nested={nested}
      icon={<StatusIndicator status={status} />}
      onClick={() => {
        setActiveDeployment(deployment.url);
      }}
    >
      {deployment.id}
    </TreeEntry>
  );
}

export function EnvironmentDeploymentList({
  commit,
  environment,
  addingDeployment,
  addDeployment,
  nested,
}: {
  commit: Commit;
  environment: Environment;
  addingDeployment: boolean;
  addDeployment: () => void;
  nested?: boolean;
}): JSX.Element {
  const deploymentQuery = commit.deployments({
    autoFetch: true,
    environmentId: environment.id,
  });
  const deployments = useObservable(
    deploymentQuery.data$,
    deploymentQuery.data,
  );
  const sortedDeployments = [...deployments]?.sort((a, b) => {
    return -a.id.localeCompare(b.id);
  });

  useAction({
    title: "New deployment",
    icon: elllIcons16.plus,
    handler: () => {
      addDeployment();
    },
  });

  if (!deployments?.length && !addingDeployment) {
    return (
      <TreeEntry
        nested={nested}
        icon={<Icon name={elllIcons16.plus} />}
        onClick={() => {
          addDeployment();
        }}
      >
        <div className="el-text-gray-400">New deployment</div>
      </TreeEntry>
    );
  }

  return (
    <>
      {sortedDeployments?.map((deployment) => (
        <DeploymentEntry
          nested={nested}
          key={deployment.id}
          deployment={deployment}
        />
      ))}
    </>
  );
}
