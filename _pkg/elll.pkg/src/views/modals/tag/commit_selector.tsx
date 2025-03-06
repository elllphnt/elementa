import { Commit } from "@repo/backend";
import {
  elllIcons16,
  Icon,
  Popper,
  ScrollArea,
  TreeEntry,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useRepository } from "~/src/hooks/backend/repository";

function CommitEntry({
  commit,
  onClick,
}: {
  commit: Commit;
  onClick: () => void;
}): JSX.Element {
  const message = useObservable(commit.message$, commit.message);
  const sha = useObservable(commit.sha$, commit.sha);

  return (
    <TreeEntry
      icon={
        <Icon
          className="el-text-green el-h-4 el-w-4 el-shrink-0"
          name={elllIcons16.version16}
        />
      }
      onClick={onClick}
    >
      {message || sha?.slice(0, 7)}
    </TreeEntry>
  );
}

export function CommitList({
  onSelected,
}: {
  onSelected: (commit: Commit) => void;
}) {
  const repository = useRepository();
  const commitQuery = repository?.commits({ autoFetch: true });
  const commits = useObservable(commitQuery?.data$, commitQuery?.data) ?? [];
  const fetching = useObservable(commitQuery?.fetching$, commitQuery?.fetching);

  return (
    <div className="el-space-y-1">
      {fetching ? (
        <p className="el-text-fg-400">Fetching commits...</p>
      ) : (
        commits.map((commit) => (
          <CommitEntry
            key={commit.id}
            commit={commit}
            onClick={() => onSelected(commit)}
          />
        ))
      )}
    </div>
  );
}

export function CommitSelector({
  onChange,
  value,
}: {
  value?: Commit;
  onChange: (commit: Commit) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined);
  const message = useObservable(value?.message$, value?.message, value?.id);
  const loaded = useObservable(value?.loaded$, value?.loaded);

  let label = "";
  let loading = false;

  if (value) {
    loading = !loaded;
    label = message || value.sha?.slice(0, 7) || value.id;
  }

  return (
    <>
      <TreeEntry
        className="el-border"
        icon={
          <Icon
            className="el-text-green el-h-4 el-w-4 el-shrink-0"
            name={elllIcons16.version16}
          />
        }
        onClick={(e) => setAnchor(e.currentTarget)}
        loading={loading}
      >
        {label || <span className="el-text-fg-300">Select a commit</span>}
      </TreeEntry>

      <Popper
        anchor={anchor}
        onClose={() => setAnchor(undefined)}
        filled
        shadow
        border
        offset={4}
        align="stretch"
        position="bottom"
        exclusive
      >
        <ScrollArea
          scrollY
          containerClassName="el-p-2"
          rootStyle={{ height: 240 }}
        >
          <CommitList
            onSelected={(commit) => {
              onChange(commit);
              setAnchor(undefined);
            }}
          />
        </ScrollArea>
      </Popper>
    </>
  );
}
