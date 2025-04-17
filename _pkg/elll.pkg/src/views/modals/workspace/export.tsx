import { Repository } from "@repo/backend";
import { ControlMenuContainer } from "@repo/components";
import { useObservable } from "@repo/utils";
import { CopyControl } from "~/src/components/ui/controls/_uncertain/copy/copy";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElll } from "~/src/hooks/elll/elll";
import { keys } from "~/src/libs/keys";
import { ChangesView } from "./changes";

export function PublishMenu({ repository }: { repository: Repository }) {
  const elll = useElll();
  const commandName =
    useObservable(
      elll.property$(keys.configs.elll.commandName),
      elll.property(keys.configs.elll.commandName),
    ) || "elll";
  const command = `npx ${commandName}@latest add ${repository.id}`;

  return (
    <div className="el-space-y-3">
      <div
        style={{
          letterSpacing: "0.8px",
          fontSize: "0.85em",
          lineHeight: 1,
        }}
        className="el-uppercase el-text-fg-500"
      >
        Install
      </div>

      <p className="el-text-base el-text-fg-400">
        Install the latest snapshot of this project into your frontend codebase.
      </p>
      <CopyControl value={command} className="el-font-mono" />
    </div>
  );
}
export function InstallMenu({ repository }: { repository: Repository }) {
  const elll = useElll();
  const commandName =
    useObservable(
      elll.property$(keys.configs.elll.commandName),
      elll.property(keys.configs.elll.commandName),
    ) || "elll";
  const command = `npx ${commandName}@latest add ${repository.id}`;

  return (
    <div className="el-space-y-3">
      <div
        style={{
          letterSpacing: "0.8px",
          fontSize: "0.85em",
          lineHeight: 1,
        }}
        className="el-uppercase el-text-fg-500"
      >
        Install
      </div>

      <p className="el-text-base el-text-fg-400">
        Install the latest snapshot of this project into your frontend codebase.
      </p>
      <CopyControl value={command} className="el-font-mono" />
    </div>
  );
}
export function SyncMenu() {
  return (
    <div className="el-space-y-3">
      <div
        style={{
          letterSpacing: "0.8px",
          fontSize: "0.85em",
          lineHeight: 1,
        }}
        className="el-uppercase el-text-fg-500"
      >
        Sync
      </div>

      <div className="el-space-y-3">
        <p className="el-text-base el-text-fg-400">
          Sync your local environment with this project by running the following
          command.
        </p>
        <CopyControl value="npx elll@latest sync" className="el-font-mono" />
      </div>
    </div>
  );
}
export function RepositoryExportMenu({
  repository,
}: {
  repository: Repository;
}) {
  return (
    <div className="el-space-y-3">
      <PublishMenu repository={repository} />
      <hr />
      <ChangesView />
    </div>
  );
}

export function ExportMenu() {
  const repository = useRepository();

  if (!repository) {
    return (
      <ControlMenuContainer className="el-p">
        <p className="el-text-fg-400 el-text-center">No repository found.</p>
      </ControlMenuContainer>
    );
  }

  return (
    <ControlMenuContainer
      style={{
        width: 300,
      }}
    >
      <RepositoryExportMenu repository={repository} />
    </ControlMenuContainer>
  );
}
