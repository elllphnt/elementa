import { Commit, Environment } from "@repo/backend";
import {
  ActionRegistry,
  ActionRegistryContext,
  Icon,
  TreeEntry,
  TreeIndent,
  elllIcons16,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useEffect, useMemo, useState } from "react";
import { useWorkspaceState } from "../../../../hooks/workspace";
import { commitViewActiveDeploymentUrl } from "./_lib";
import { EnvironmentDeploymentList } from "./environment_deployment_list";

export function EnvironmentTree({
  environment,
  commit,
  stateKey = [],
}: {
  environment: Environment;
  commit: Commit;
  stateKey?: string[];
}): JSX.Element {
  const name = useObservable(environment.name$, environment.name);
  const [open, setOpen] = useWorkspaceState([...stateKey, "open"], true);
  const [addingDeployment, setAddingDomain] = useState(false);
  const actionRegistry = useMemo(() => {
    return new ActionRegistry();
  }, []);
  const actions = useObservable(
    actionRegistry.actions$,
    actionRegistry.actions,
  );
  const [, setActiveDeployment] = useWorkspaceState(
    commitViewActiveDeploymentUrl(commit.id),
  );

  useEffect(() => {
    if (addingDeployment && !open) {
      setOpen(true);
    }
  }, [addingDeployment, open]);

  const handleAddDeployment = async () => {
    try {
      setAddingDomain(true);
      const deployment = await commit.deploy({ environmentId: environment.id });
      setActiveDeployment(deployment.url);
    } finally {
      setAddingDomain(false);
    }
  };

  return (
    <ActionRegistryContext.Provider value={actionRegistry}>
      <TreeEntry
        nested
        container
        open={open}
        icon={<Icon name={elllIcons16.drive} className="el-text-blue" />}
        onToggleOpen={setOpen}
        onClick={() => setOpen(!open)}
        actions={actions.map((action) => ({
          icon: <Icon name={action.icon} />,
          handler: (e) => {
            e.stopPropagation();
            action.handler?.(e);
          },
        }))}
        loading={addingDeployment}
      >
        {name}
      </TreeEntry>

      {open ? (
        <TreeIndent>
          <EnvironmentDeploymentList
            addingDeployment={addingDeployment}
            addDeployment={handleAddDeployment}
            environment={environment}
            commit={commit}
            nested
          />
        </TreeIndent>
      ) : (
        <></>
      )}
    </ActionRegistryContext.Provider>
  );
}
