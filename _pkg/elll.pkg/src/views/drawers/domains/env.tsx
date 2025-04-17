import {
  Icon,
  ScrollArea,
  TreeEntry,
  elllIcons16,
  useAction,
  useControlMenu,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useState } from "react";
import { useEnvironments } from "../../../hooks/backend/environments";
import { useRepository } from "../../../hooks/backend/repository";
import { modalViews } from "../../modals/_";
import { EnvironmentTree } from "./environment_tree";

export function EnvironmentsView(): JSX.Element {
  const { openMenu } = useControlMenu();
  const repository = useRepository();
  const environments = useEnvironments();
  const shell = useShell();

  const [addingEnvironment, setAddingEnvironment] = useState(false);
  const [creatingEnvironment, setCreatingEnvironment] = useState(false);

  useAction({
    title: "Add environment",
    icon: elllIcons16.plus,
    handler: async () => {
      setAddingEnvironment(true);
    },
  });

  const handleNewEnvironment = async (_name: string) => {
    const name = _name.toLocaleLowerCase().trim();
    if (!name || !repository) {
      setAddingEnvironment(false);
      return;
    }
    try {
      setCreatingEnvironment(true);
      const environment = await repository.createEnvironment(name);
      openMenu({
        title: "Environment",
        viewId: modalViews.environment.id,
        props: { environment },
      });
    } catch (e) {
      console.error(e);
      shell.showNotification({
        message: "Failed to create environment",
      });
    } finally {
      setCreatingEnvironment(false);
      setAddingEnvironment(false);
    }
  };

  return (
    <ScrollArea scrollY containerClassName="el-p-2 el-pt-1 el-space-y-2">
      {addingEnvironment && (
        <TreeEntry
          nested
          icon={<Icon name={elllIcons16.drive} className="el-text-blue" />}
          loading={creatingEnvironment}
        >
          <input
            autoFocus
            type="text"
            className="el-outline-none el-w-full"
            placeholder="Environment name"
            onBlur={(e) => {
              handleNewEnvironment(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
        </TreeEntry>
      )}
      {environments?.map((environment) => (
        <EnvironmentTree
          key={environment.id}
          environment={environment}
          stateKey={["elll", "drawers", "environments", environment.id]}
        />
      ))}
    </ScrollArea>
  );
}
