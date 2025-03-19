import { Repository } from "@repo/backend";
import { ControlMenuContainer } from "@repo/components";
import { CopyControl } from "~/src/components/ui/controls/_uncertain/copy/copy";
import { useRepository } from "~/src/hooks/backend/repository";

export function InstallMenu({ repository }: { repository: Repository }) {
  const command = `npx elll@latest init ${repository.id}`;

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
        Connect your local environment to this project by running the following
        command.
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
    <div
      style={{
        width: 300,
      }}
      className="el-space-y-3"
    >
      <InstallMenu repository={repository} />
      <hr />
      <SyncMenu />
    </div>
  );
}

export function ExportMenu() {
  const repository = useRepository();

  if (!repository) {
    return (
      <div className="el-p">
        <p className="el-text-fg-400 el-text-center">No repository found.</p>
      </div>
    );
  }

  return (
    <ControlMenuContainer
      style={{
        width: 300,
      }}
      className="el-space-y-3"
    >
      <RepositoryExportMenu repository={repository} />
    </ControlMenuContainer>
  );
}
