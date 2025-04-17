import { Environment } from "@repo/backend";
import {
  ActionRegistry,
  ActionRegistryContext,
  Icon,
  TreeEntry,
  TreeIndent,
  elllIcons16,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useEffect, useMemo, useState } from "react";
import { useEnvironmentLatestDeployment } from "~/src/hooks/backend/deployments";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { StatusIndicator } from "~/src/views/drawers/versions/status_indicator";
import { EnvironmentDomainList } from "./environment_domain_list";

export function EnvironmentTree({
  environment,
  stateKey = [],
}: {
  environment: Environment;
  stateKey?: string[];
}): JSX.Element {
  const name = useObservable(environment.name$, environment.name);
  const [open, setOpen] = useWorkspaceState([...stateKey, "open"], false);
  const [addingDomain, setAddingDomain] = useState(false);
  const { openMenu } = useControlMenu();
  const actionRegistry = useMemo(() => {
    return new ActionRegistry();
  }, []);
  const actions = useObservable(
    actionRegistry.actions$,
    actionRegistry.actions,
  );
  const latestDeployment = useEnvironmentLatestDeployment({
    environment,
  });
  const latestStatus = useObservable(
    latestDeployment?.status$,
    latestDeployment?.status,
  );

  useEffect(() => {
    if (addingDomain && !open) {
      setOpen(true);
    }
  }, [addingDomain, open]);

  return (
    <ActionRegistryContext.Provider value={actionRegistry}>
      <TreeEntry
        nested
        container
        open={open}
        icon={<Icon name={elllIcons16.drive} className="el-text-blue" />}
        onToggleOpen={setOpen}
        onClick={() => {
          setOpen(!open);
        }}
        actions={actions.map((action) => ({
          icon: <Icon name={action.icon} />,
          handler: (e) => {
            e.stopPropagation();
            action.handler?.(e);
          },
        }))}
        loading={["pending", "running"].includes(latestStatus ?? "")}
        suffix={
          <StatusIndicator
            button
            status={latestStatus}
            onClick={() => {
              window.open(`https://${environment.pointer?.domain}`, "_blank");
            }}
          />
        }
      >
        {name}
      </TreeEntry>

      {open ? (
        <TreeIndent>
          <EnvironmentDomainList
            addingDomain={addingDomain}
            setAddingDomain={setAddingDomain}
            environment={environment}
            nested
          />
        </TreeIndent>
      ) : (
        <></>
      )}
    </ActionRegistryContext.Provider>
  );
}
