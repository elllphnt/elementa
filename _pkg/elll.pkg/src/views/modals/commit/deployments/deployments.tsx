import { Commit, Deployment, LogSink } from "@repo/backend";
import { ScrollArea, TreeEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import moment from "moment";
import { elllPropertyKeys } from "../../../../elll/property_keys";
import { ElllServerConfig } from "../../../../elll/setup";
import { useEnvironments } from "../../../../hooks/backend/environments";
import { useElll } from "../../../../hooks/elll/elll";
import { useWorkspaceState } from "../../../../hooks/workspace";
import { StatusIndicator } from "../../../drawers/versions/status_indicator";
import { commitViewActiveDeploymentUrl } from "./_lib";
import { EnvironmentTree } from "./environment_tree";

function DeploymentEntry({
  deployment,
  onClick,
}: {
  deployment: Deployment;
  onClick: () => void;
}): JSX.Element {
  const status = useObservable(deployment.status$, deployment.status);
  const environment = useObservable(
    deployment.environment$,
    deployment.environment,
  );
  const environmentName = useObservable(environment?.name$, environment?.name);

  let suffix = <></>;

  if (environmentName) {
    suffix = (
      <div className="el-text-fg el-bg-fg/10 el-px-1 el-rounded-sm el-py-0.5">
        {environmentName}
      </div>
    );
  }

  return (
    <TreeEntry
      icon={<StatusIndicator status={status} />}
      suffix={suffix}
      onClick={onClick}
    >
      {deployment.id}
    </TreeEntry>
  );
}

function LogSinkViewer({ logSink }: { logSink: LogSink }): JSX.Element {
  const logsQuery = logSink.logs({ autoFetch: true });
  const logs = useObservable(logsQuery.data$, logsQuery.data);
  const sortedLogs = [...logs].sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return a.timestamp - b.timestamp;
    } else {
      return 0;
    }
  });

  return (
    <ScrollArea scrollX scrollY>
      {sortedLogs.map((log) => (
        <pre
          key={log.id}
          style={{
            fontFamily: "monospace",
          }}
        >
          {log.timestamp}: {log.message}
        </pre>
      ))}
    </ScrollArea>
  );
}

function DeploymentViewer({
  deployment,
}: {
  deployment: Deployment;
}): JSX.Element {
  const elll = useElll();
  const createdAt = useObservable(deployment.createdAt$, deployment.createdAt);
  const status = useObservable(deployment.status$, deployment.status);
  const logSink = useObservable(deployment.logSink$, deployment.logSink);

  let statusElement: JSX.Element;
  if (status === "pending") {
    statusElement = <div className="el-text-fg el-animate-pulse">Pending</div>;
  } else if (status === "running") {
    statusElement = (
      <div className="el-text-yellow el-animate-pulse">Running</div>
    );
  } else if (status === "succeeded") {
    statusElement = (
      <button
        className="el-bg-pm el-text-pm-ctr el-h-6 el-px-2 el-rounded"
        onClick={() => {
          const serverConfig = elll.properties.value<ElllServerConfig>(
            elllPropertyKeys.elllServerConfig,
          );
          if (!serverConfig) {
            elll.shell.toast({ message: "No server config found" });
            return;
          }
          const serverFallbackProtocol = serverConfig.fallbackProtocol;
          const serverFallbackDomain = serverConfig.fallbackDomain;

          window.open(
            `${serverFallbackProtocol}://${deployment.id}.${serverFallbackDomain}`,
            "_blank",
          );
        }}
      >
        Visit
      </button>
    );
  } else if (status === "failed") {
    statusElement = <div className="el-text-red">Failed</div>;
  } else {
    statusElement = <div className="el-text-red">{status}</div>;
  }

  return (
    <div
      className="el-space-y-2"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
        }}
      >
        <div
          style={{
            flexGrow: 1,
          }}
        >
          <div className="el-text-fg-500">{deployment.id}</div>
          <div className="el-flex">
            <div style={{ flexGrow: 1 }}>{moment(createdAt).fromNow()}</div>
          </div>
        </div>
        <div>{statusElement}</div>
      </div>

      <hr />
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {logSink ? <LogSinkViewer logSink={logSink} /> : <></>}
      </div>
    </div>
  );
}
function NoDeployment(): JSX.Element {
  return (
    <div className="el-h-full el-w-full el-space-y-2">
      <p className="el-text-fg-500 el-text-center">
        No deployment selected. Click on a deployment to view it's details.
      </p>
    </div>
  );
}

export function CommitDeploymentsView({
  commit,
}: {
  commit: Commit;
}): JSX.Element {
  const environments = useEnvironments();
  const elll = useElll();

  let [activeDeploymentUrl] = useWorkspaceState<string>(
    commitViewActiveDeploymentUrl(commit.id),
  );
  const activeDeployment = (
    activeDeploymentUrl
      ? elll.backend.instance(activeDeploymentUrl, true)
      : undefined
  ) as Deployment | undefined;

  return (
    <div
      className="el-flex el-gap-3 el-h-full el-w-full"
      style={{
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <div
        className="el-space-y-2"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          className="el-space-y-1 no-scrollbar"
          style={{
            width: 200,
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          {environments?.map((environment) => (
            <EnvironmentTree
              key={environment.id}
              commit={commit}
              environment={environment}
              stateKey={[
                "commit-deployments",
                commit.id,
                "environment-tree",
                environment.id,
              ]}
            />
          ))}
        </div>
      </div>

      <div className="el-h-full el-border-r" />

      <div
        className="el-h-full"
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {activeDeployment ? (
          <DeploymentViewer deployment={activeDeployment} />
        ) : (
          <NoDeployment />
        )}
      </div>
    </div>
  );
}
