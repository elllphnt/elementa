import { Commit } from "@repo/backend";
import { ProgressBar } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useRepository } from "~/src/hooks/backend/repository";

export function CommitView({ commit }: { commit: Commit }): JSX.Element {
  const message = useObservable(commit.message$, commit.message);
  const [restoring, setRestoring] = useState(false);
  const repository = useRepository();

  const handleRestore = () => {
    if (repository) {
      setRestoring(true);
      repository
        .resetWorkspace({
          commit_id: commit.id,
        })
        .finally(() => {
          setRestoring(false);
        });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 300,
      }}
      className="el-gap-2"
    >
      <div className="el-space-y-1 el-shrink-0">
        <div className="el-text-fg-800 el-font-bold el-text-lg">{message}</div>
      </div>
      <div className="el-grow" />
      <div>
        <button
          disabled={restoring}
          onClick={handleRestore}
          className="el-relative el-overflow-hidden el-h-7 el-w-full el-rounded el-bg-fg/5 hover:el-bg-fg/10 disabled:el-text-fg-300 "
        >
          Restore this commit
          {restoring ? (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <ProgressBar height={1} />
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
}
