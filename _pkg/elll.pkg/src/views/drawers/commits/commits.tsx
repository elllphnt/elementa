import { Commit } from "@repo/backend";
import {
  Icon,
  ScrollArea,
  TreeEntry,
  elllIcons16,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import React from "react";
import { useRepository } from "../../../hooks/backend/repository";
import { modalViews } from "../../modals/_";

function CommitEntry({ commit }: { commit: Commit }): JSX.Element {
  const { openMenu } = useControlMenu();

  const message = useObservable(commit.message$, commit.message);
  const sha = useObservable(commit.sha$, commit.sha);
  // const isProduction = productionCommitSha === commit.sha;

  const handleClick = (e: React.MouseEvent) => {
    openMenu({
      title: "Commit",
      anchor: e.currentTarget as HTMLElement,
      viewId: modalViews.commit.id,
      props: {
        commit,
      },
    });
  };

  return (
    <TreeEntry
      icon={
        <Icon
          className="el-text-green el-h-4 el-w-4 el-shrink-0"
          name={elllIcons16.version16}
        />
      }
      onClick={handleClick}
    >
      {message || sha?.slice(0, 7)}
    </TreeEntry>
  );
}

export function CommitsView(): JSX.Element {
  const repository = useRepository();
  const commitQuery = repository?.commits({ autoFetch: true });
  const commits = useObservable(commitQuery?.data$, commitQuery?.data) ?? [];
  const hasMore = useObservable(commitQuery?.hasMore$, commitQuery?.hasMore);
  const fetching = useObservable(commitQuery?.fetching$, commitQuery?.fetching);

  return (
    <ScrollArea
      scrollY
      containerClassName="el-space-y-1 el-px-2 el-pt-1 el-pb-2"
    >
      {commits.map((commit) => (
        <CommitEntry key={commit.sha} commit={commit} />
      ))}

      {hasMore ? (
        <div>
          <button
            className="el-pl-2 el-text-fg-500 hover:el-text-fg-500 el-text-sm"
            onClick={() => {
              if (commitQuery?.fetching) {
                return;
              }
              commitQuery?.fetch();
            }}
            disabled={fetching}
          >
            {fetching ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </ScrollArea>
  );
}
