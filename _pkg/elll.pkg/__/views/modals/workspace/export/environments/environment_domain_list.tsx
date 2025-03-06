import { Domain, Environment } from "@repo/backend";
import {
  Icon,
  TreeEntry,
  elllIcons16,
  useAction,
  useControlMenu,
} from "@repo/components";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useEnvironmentDomains } from "~/src/hooks/backend/domain";
import { useTenant } from "~/src/hooks/backend/tenant";
import { modalViews } from "../../../_";

function DomainEntry({
  domain,
  onOpen,
  nested,
}: {
  domain: Domain;
  onOpen: () => void;
  nested?: boolean;
}) {
  return (
    <TreeEntry
      nested={nested}
      icon={
        <Icon name={elllIcons16.activityWeb} color="#08f" onClick={onOpen} />
      }
      onClick={() => {
        window.open(`https://${domain.name}`, "_blank");
      }}
      actions={[
        {
          icon: <Icon name={elllIcons16.properties} />,
          handler: (e) => {
            e.stopPropagation();
            onOpen();
          },
        },
      ]}
    >
      {domain.name}
    </TreeEntry>
  );
}

export function EnvironmentDomainList({
  environment,
  addingDomain,
  setAddingDomain,
  nested,
}: {
  environment: Environment;
  addingDomain: boolean;
  setAddingDomain: (value: boolean) => void;
  nested?: boolean;
}): JSX.Element {
  const { openMenu } = useControlMenu();
  const tenant = useTenant();
  const domains = useEnvironmentDomains(environment);
  const pointer = useObservable(environment.pointer$, environment.pointer);
  const shell = useShell();

  const [creatingDomain, setCreatingDomain] = useState(false);

  const handleNewDomain = async (_name: string) => {
    const name = _name.toLocaleLowerCase().trim();
    if (!name || !tenant || !pointer) {
      setAddingDomain(false);
      return;
    }
    try {
      setCreatingDomain(true);
      const domain = await tenant.createDomain(name);
      await domain.assignPointer(pointer.name);
      openDomain({ domain });
    } catch (e) {
      console.error(e);
      shell.showNotification({
        title: "Failed to create domain",
        message: e instanceof Error ? e.message : "An error occurred",
      });
    } finally {
      setCreatingDomain(false);
      setAddingDomain(false);
    }
  };
  const openDomain = async ({
    domain,
    anchor,
  }: {
    domain: Domain;
    anchor?: HTMLElement;
  }) => {
    openMenu({
      title: "Domain",
      viewId: modalViews.domain.id,
      anchor,
      props: {
        domain,
      },
    });
  };

  useAction({
    title: "Add domain",
    icon: elllIcons16.plus,
    handler: () => {
      setAddingDomain(true);
    },
  });

  if (!domains?.length && !addingDomain) {
    return (
      <TreeEntry
        nested={nested}
        icon={<Icon name={elllIcons16.plus} />}
        onClick={() => {
          setAddingDomain(true);
        }}
      >
        <div className="el-text-gray-400">Add domain</div>
      </TreeEntry>
    );
  }

  return (
    <>
      {addingDomain && (
        <TreeEntry
          nested={nested}
          icon={<Icon name={elllIcons16.activityWeb} color="#08f" />}
          loading={creatingDomain}
        >
          <input
            autoFocus
            type="text"
            className="el-outline-none el-w-full"
            placeholder="Domain name"
            onBlur={(e) => {
              handleNewDomain(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
        </TreeEntry>
      )}
      {domains?.map((domain) => (
        <DomainEntry
          nested={nested}
          key={domain.name}
          domain={domain}
          onOpen={() => {
            openDomain({ domain });
          }}
        />
      ))}
    </>
  );
}
