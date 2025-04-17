import { Deployment } from "@repo/backend";
import { Icon, TreeEntry, elllIcons16 } from "@repo/components";
import { useObservable } from "@repo/utils";
import { StatusIndicator } from "~/src/views/drawers/versions/status_indicator";

export function DeploymentEntry({
  deployment,
  onClick,
  nested,
}: {
  deployment: Deployment;
  onClick?: () => void;
  nested?: boolean;
}) {
  const commit = useObservable(deployment.commit$, deployment.commit);
  const commitMessage = useObservable(commit?.message$, commit?.message);
  const status = useObservable(deployment.status$, deployment.status);

  return (
    <TreeEntry
      icon={
        <Icon name={elllIcons16.version16} color="#08f" onClick={onClick} />
      }
      onClick={onClick}
      suffix={<StatusIndicator status={status} />}
      loading
    >
      {commitMessage || commit?.sha?.slice(0, 7)}
    </TreeEntry>
  );
}
