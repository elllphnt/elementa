import { useObservable } from "@repo/utils";
import { useRepository } from "~/src/hooks/backend/repository";
import { diffRecords } from "~/src/libs/vcs";

export function useRepositoryWorkspaceChanges() {
  const repository = useRepository();
  const head = useObservable(repository?.headCommit$, repository?.headCommit);
  const workspaceRecord = useObservable(
    repository?.workspaceRecord$({ autoFetch: true }),
    repository?.workspaceRecord({ autoFetch: true }),
  );
  const commitRecord = useObservable(
    head?.record$({ autoFetch: true }),
    head?.record({ autoFetch: true }),
  );
  const fetchingCommitRecord = useObservable(
    head?.fetchingRecord$,
    head?.fetchingRecord,
  );
  console.log("WorkspaceChanges", {
    head,
    workspaceRecord,
    commitRecord,
    fetchingCommitRecord,
  });
  const changes = workspaceRecord
    ? diffRecords(commitRecord ?? {}, workspaceRecord)
    : [];
  //   const changes = diffRecords(commitRecord ?? {}, {});

  const loading = !!head && (fetchingCommitRecord || !commitRecord);

  return [changes, { loading }] as const;
}
