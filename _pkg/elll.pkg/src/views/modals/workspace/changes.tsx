import { ProgressBar, ScrollArea } from "@repo/components";
import { useCallback, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { DrawerLoader } from "~/src/components/ui/drawers/_common/drawer_loader";
import { CommitRecordDiff } from "~/src/libs/vcs";
import { useElll } from "../../../hooks/elll/elll";
import { useRepositoryWorkspaceChanges } from "../../drawers/changes/_hooks";
import { WorkspaceChangeEntry } from "../../drawers/changes/change_entry";

function ChangeList({
  changes,
  loading,
}: {
  changes: CommitRecordDiff;
  loading: boolean;
}) {
  if (loading) {
    return <DrawerLoader />;
  } else if (!changes.length) {
    return (
      <div className="el-w-full el-h-full el-text-fg-400 el-flex el-flex-col el-items-center el-justify-center el-p-4 el-text-center el-space-y-2">
        <p>Nothing to commit.</p>
        <p>Changes made to the workspace will appear here.</p>
      </div>
    );
  } else {
    return (
      <ScrollArea scrollY>
        <div className="el-w-full el-pt-1 el-pb-2 el-space-y-1">
          {changes?.map((change) => (
            <WorkspaceChangeEntry key={change.id} change={change} />
          ))}
        </div>
      </ScrollArea>
    );
  }
}

export function CommitControl(): JSX.Element {
  const elll = useElll();
  const [changes, { loading }] = useRepositoryWorkspaceChanges();

  const [message, setMessage] = useState<string>("");
  const [commiting, setCommiting] = useState<boolean>(false);

  const handleSubmit = useCallback(() => {
    const user = elll.user;
    const repository = elll.repository;
    if (!user) {
      elll.shell.toast({
        message: "No user found. Please login to commit changes.",
      });
      return;
    }
    if (!repository) {
      elll.shell.toast({
        message: "No repository found. Please open a repository.",
      });
      return;
    }
    setCommiting(true);
    repository
      ?.commitWorkspace({ message, committer: user.id })
      .then(() => {
        setMessage("");
      })
      .finally(() => {
        setTimeout(() => {
          setCommiting(false);
        });
      });
  }, [message]);

  return (
    <form
      className="el-space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div
        style={{
          position: "relative",
        }}
        className="el-shrink-0 el-w-full el-rounded el-overflow-hidden"
      >
        <TextareaAutosize
          className="el-w-full el-px-2 el-py-1 el-outline-none el-border el-rounded"
          placeholder="Change summary"
          maxRows={3}
          value={message}
          style={{
            resize: "none",
            display: "block",
            background: "transparent",
          }}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
          }}
        >
          {commiting && <ProgressBar />}
        </div>
      </div>

      <button
        type="submit"
        className="el-p-1 el-px-2 el-rounded el-w-full el-bg-pm el-text-pm-ctr disabled:el-bg-fg/20 disabled:el-text-fg-400 el-transition-colors"
        disabled={commiting || !changes?.length}
      >
        Commit
      </button>
    </form>
  );
}

export function ChangesView(): JSX.Element {
  const [changes, { loading }] = useRepositoryWorkspaceChanges();

  return (
    <div
      className="el-flex el-flex-col el-gap-2"
      style={{
        height: 300,
      }}
    >
      <CommitControl />

      <div className="el-grow el-overflow-hidden">
        <ChangeList changes={changes} loading={loading} />
      </div>
    </div>
  );
}
