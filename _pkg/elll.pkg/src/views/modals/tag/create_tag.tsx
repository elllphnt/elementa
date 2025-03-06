import { Commit, RepositoryTag } from "@repo/backend";
import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { FormEvent, useEffect, useState } from "react";
import bump from "semver/functions/inc";
import { useRepository } from "~/src/hooks/backend/repository";
import { CommitSelector } from "./commit_selector";

const arrowNext = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

function CommitEntry({ commit }: { commit: Commit }): JSX.Element {
  const message = useObservable(commit.message$, commit.message);
  const sha = useObservable(commit.sha$, commit.sha);

  return (
    <TreeEntry
      className="el-border"
      icon={
        <Icon
          className="el-text-green el-h-4 el-w-4 el-shrink-0"
          name={elllIcons16.version16}
        />
      }
    >
      {message || sha?.slice(0, 7)}
    </TreeEntry>
  );
}

export function CreateVersionModal({ onComplete }: { onComplete: () => void }) {
  const repository = useRepository();
  const headCommit = useObservable(
    repository?.headCommit$,
    repository?.headCommit,
  );
  const latestPointer = useObservable(
    repository?.pointer$("latest"),
    repository?.pointer("latest"),
  );
  const latestTag = latestPointer?.tag_id
    ? repository?.backend.instance<RepositoryTag>(latestPointer.tag_id)
    : undefined;
  const latestTagName = useObservable(latestTag?.name$, latestTag?.name);
  const latestTagCommit = useObservable(latestTag?.commit$, latestTag?.commit);
  const [versionName, setVersionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [commit, setCommit] = useState<Commit | undefined>(undefined);

  const handleCreateTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!commit) {
      return;
    }

    try {
      setCreating(true);
      const tag = await repository?.createTag({
        name: versionName,
        commit_id: commit.id,
      });
      if (!tag) {
        setError("Failed to create version. Please try again.");
        return;
      }
      await repository?.setPointer("latest", tag.id);
      onComplete();
    } catch (e) {
      console.error(e);
      setError("An error occurred while creating version. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const valid = !!versionName && !!commit;

  useEffect(() => {
    if (headCommit && !commit) {
      setCommit(headCommit);
    }
  }, [headCommit, commit]);

  const majorVersion = bump(latestTag?.name || "0.0.0", "major") || "1.0.0";
  const minorVersion = bump(latestTag?.name || "0.0.0", "minor") || "0.1.0";
  const patchVersion = bump(latestTag?.name || "0.0.0", "patch") || "0.0.1";

  useEffect(() => {
    if (!versionName && minorVersion) {
      setVersionName(minorVersion);
    }
  }, [versionName, minorVersion]);

  return (
    <form
      className="el-p-3 el-rounded el-space-y-3"
      style={{
        maxWidth: 400,
      }}
      onSubmit={handleCreateTag}
    >
      <p className="el-font-semibold">Create a New Version</p>
      <div className="el-space-y-1">
        <p className="el-text-fg-400">
          Versions are immutable snapshots of your repository. Use them to mark
          important states or releases, such as milestones, stable versions, or
          feature completions.
        </p>
      </div>

      {error && <p className="el-text-red">{error}</p>}

      <div className="el-flex el-gap-2">
        <div className="el-w-1/2">
          {latestTag ? (
            <div className="el-w-full el-space-y-1">
              {latestTagCommit ? (
                <CommitEntry commit={latestTagCommit} />
              ) : (
                <> </>
              )}
              <div className="el-w-full el-px-2 el-py-1 el-border border-gray-200 el-rounded el-outline-none">
                {latestTagName}
              </div>
            </div>
          ) : (
            <div className="el-w-full el-space-y-1 el-h-full el-border el-rounded el-border-dashed el-text-fg-300 el-text-center el-flex el-items-center el-justify-center">
              No versions yet.
              <br />
              Create your first one!
            </div>
          )}
        </div>
        <div className="el-w-4 el-flex el-items-center el-justify-center">
          <div className="el-w-4 el-h-4 el-shrink-0">{arrowNext}</div>
        </div>
        <div className="el-w-1/2 el-space-y-1">
          <CommitSelector
            value={commit}
            onChange={(commit) => {
              setCommit(commit);
            }}
          />
          <input
            className="el-w-full el-px-2 el-py-1 el-border border-gray-200 el-rounded el-outline-none"
            placeholder="Version"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
          />
          <div className="el-flex el-gap-1">
            <div
              className={cx("el-cursor-pointer el-px-1 el-rounded", {
                "el-text-sm el-bg-fg/5 hover:el-bg-fg/10":
                  versionName !== majorVersion,
                "el-bg-pm el-text-pm-ctr": versionName === majorVersion,
              })}
              onClick={() => setVersionName(majorVersion)}
            >
              Major
            </div>
            <div
              className={cx("el-cursor-pointer el-px-1 el-rounded", {
                "el-text-sm el-bg-fg/5 hover:el-bg-fg/10":
                  versionName !== minorVersion,
                "el-bg-pm el-text-pm-ctr": versionName === minorVersion,
              })}
              onClick={() => setVersionName(minorVersion)}
            >
              Minor
            </div>
            <div
              className={cx("el-cursor-pointer el-px-1 el-rounded", {
                "el-text-sm el-bg-fg/5 hover:el-bg-fg/10":
                  versionName !== patchVersion,
                "el-bg-pm el-text-pm-ctr": versionName === patchVersion,
              })}
              onClick={() => setVersionName(patchVersion)}
            >
              Patch
            </div>
          </div>
        </div>
      </div>

      <div className="el-flex el-gap-2 el-justify-end">
        <button
          type="submit"
          className={cx("el-rounded el-px-2 el-py-1", {
            "el-bg-pm hover:el-bg-pm-400 el-text-pm-ctr": valid,
            "el-bg-bg-200/50": !valid,
          })}
          disabled={!valid || creating}
        >
          {creating ? "Creating Version..." : "Create Version"}
        </button>
      </div>
    </form>
  );
}
