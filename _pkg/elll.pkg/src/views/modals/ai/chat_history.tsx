import { IntelligenceThread } from "@repo/backend/dist/resources/thread";
import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { useObservable } from "@repo/utils";
import moment from "moment";
import { useTenant } from "../../../hooks/backend/tenant";
import { useWorkspaceState } from "../../../hooks/workspace";

export function ChatHistoryView({
  onThread,
}: {
  onThread: (thread: IntelligenceThread) => void;
}) {
  const tenant = useTenant();
  const threadQuery = tenant?.threads({ autoFetch: true });
  const threads = useObservable(threadQuery?.data$, threadQuery?.data) ?? [];

  return (
    <div className="el-space-y-2">
      {threads.map((thread) => (
        <ThreadEntry
          key={thread.id}
          thread={thread}
          onClick={() => {
            onThread(thread);
          }}
        />
      ))}
    </div>
  );
}

function ThreadEntry({
  thread,
  onClick,
}: {
  thread: IntelligenceThread;
  onClick: () => void;
}) {
  const [activeTheadId] = useWorkspaceState<string | undefined>(
    "activeThreadId",
  );
  const title = useObservable(thread.title$, thread.title);
  const date = useObservable(thread.createdAt$, thread.createdAt);
  const deleting = useObservable(thread.deleting$, thread.deleting);

  return (
    <TreeEntry
      active={activeTheadId === thread.id}
      icon={<Icon name={elllIcons16.ai} />}
      loading={deleting}
      actions={[
        {
          icon: <Icon name={elllIcons16.trash} />,
          handler: () => {
            thread.delete();
          },
        },
      ]}
      onClick={onClick}
    >
      {title}{" "}
      <span className="el-text-fg-400 el-text-xs el-text-italic">
        {moment(date).fromNow()}
      </span>
    </TreeEntry>
  );
}
