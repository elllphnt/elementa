import {
  AgentAction,
  AgentActionStatus,
  AgentMessage,
} from "@elllphnt/elll-acp";
import { IntelligenceThread, IntelligenceThreadEntry } from "@repo/backend";
import {
  ActionBar,
  ActionRegistry,
  elllIcons16,
  Icon,
  ProgressBar,
  ProgressCircle,
  ScrollArea,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import React, { memo, useMemo, useState } from "react";
import AutosizeTextArea from "react-textarea-autosize";
import { useWorkspace } from "~/src/hooks/backend/workspace";
import { useElll } from "~/src/hooks/elll/elll";
import { useBackend } from "../../../hooks/backend/backend";
import { useWorkspaceState } from "../../../hooks/shell/workspace";

export function CopilotPanel(): JSX.Element {
  return (
    <div
      className="el-h-full el-w-full el-flex el-flex-col"
      style={{
        pointerEvents: "auto",
      }}
    >
      <Thread />
      <Input />
    </div>
  );
}

function Input() {
  const elll = useElll();
  const workspace = useWorkspace();
  const backend = useBackend();
  const [activeTheadId, setActiveThreadId] = useWorkspaceState<
    string | undefined
  >("activeThreadId");
  const [input, setInput] = useState<string>("");
  const { openMenu, closeMenu } = useControlMenu();

  const actionRegistry = useMemo(() => {
    const actionRegistry = new ActionRegistry();
    actionRegistry.registerAction({
      title: "New Chat",
      icon: elllIcons16.plus,
      handler: () => {
        setActiveThreadId(undefined);
      },
    });
    actionRegistry.registerAction({
      title: "Chat history",
      icon: elllIcons16.folderOpen,
      handler: (e) => {
        // openMenu({
        //   title: "Chat history",
        //   anchor: e.currentTarget as HTMLElement,
        //   viewId: modalViews.chatHistory.id,
        //   props: {
        //     activeThreadId: activeTheadId,
        //     onThread: (thread: IntelligenceThread) => {
        //       setActiveThreadId(thread.id);
        //       closeMenu();
        //     },
        //   },
        // });
      },
    });

    return actionRegistry;
  }, []);

  const sendMessage = async (message: string) => {
    if (!workspace) return;
    let thread = activeTheadId
      ? backend.instance<IntelligenceThread>(activeTheadId, true)
      : undefined;

    if (!thread) {
      thread = await workspace.createIntelligenceThread();
      if (thread) {
        setActiveThreadId(thread.id);
      }
    }

    thread?.postMessage({
      content: [
        {
          text: message,
        },
      ],
      data: {
        context: {
          workspaceId: workspace.id,
        },
      },
    });
  };

  const handleSubmit = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <div
      className="el-bg-bg-100/50 el-border-t"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        position: "relative",
      }}
    >
      <AutosizeTextArea
        style={{
          width: "100%",
          resize: "none",
          outline: "none",
          margin: 0,
          display: "block",
          background: "none",
        }}
        minRows={2}
        maxRows={4}
        placeholder="Type a message..."
        className="el-p-3 el-w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.ctrlKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="el-flex el-items-center el-w-full el-pb-1 el-px-2 el-justify-between">
        <ActionBar registry={actionRegistry} />

        <button
          onClick={handleSubmit}
          className="el-shrink-0 hover:el-bg-bg-200 el-rounded el-h-5 el-px-1.5 el-text-sm el-text-fg/70 hover:el-text-fg"
        >
          Send
        </button>
      </div>
    </div>
  );
}

const ThreadEntry = memo(function ThreadEntry({
  entry,
}: {
  entry: IntelligenceThreadEntry;
}) {
  const type = useObservable(entry.type$, entry.type);

  if (type === "message") {
    return <Message message={entry} />;
  } else if (type === "action") {
    return <ActionEntry entry={entry} />;
  }
});

const ActionEntry = memo(function ActionEntry({
  entry,
}: {
  entry: IntelligenceThreadEntry;
}) {
  const data = useObservable(entry.data$, entry.data) as
    | AgentAction
    | undefined;

  let statusClass = "el-bg-fg/20 el-text-fg";
  let statusIcon: React.ReactNode = (
    <Icon name={elllIcons16.play} className="el-h-4 el-w-4" />
  );

  if (data?.status === AgentActionStatus.Running) {
    statusClass = "el-bg-yellow/20 el-text-yellow";
    statusIcon = <ProgressCircle size={12} />;
  } else if (data?.status === AgentActionStatus.Completed) {
    statusClass = "el-bg-green/20 el-text-green";
    statusIcon = (
      <Icon name={elllIcons16.circleCheckmark} className="el-h-4 el-w-4" />
    );
  } else if (
    data?.status === AgentActionStatus.Failed ||
    data?.status === AgentActionStatus.Aborted
  ) {
    statusClass = "el-bg-red/20 el-text-red";
    statusIcon = <Icon name={elllIcons16.cross} className="el-h-4 el-w-4" />;
  }

  return (
    <div className="el-px-3 el-space-y-2 el-w-full">
      <div className="el-p-2 el-rounded-lg el-border el-flex el-gap-2 el-bg-bg-100">
        <div
          className={cx(
            "el-h-6 el-w-6 el-flex el-items-center el-justify-center el-rounded-full",
            statusClass,
          )}
        >
          {statusIcon}
        </div>
        <div className="el-space-y-1">
          <div
            style={{
              textTransform: "capitalize",
            }}
          >
            {data?.action}
          </div>
          <div className="el-text-xs el-text-fg-400">{data?.message}</div>
        </div>
      </div>
    </div>
  );
});

const Message = memo(function Message({
  message,
}: {
  message: IntelligenceThreadEntry;
}) {
  const data = useObservable(message.data$, message.data) as
    | AgentMessage
    | undefined;
  const content = data?.content || [];
  const isUser = data?.role === "user";
  const author = isUser ? "User" : "Copilot";

  return (
    <div
      className="el-px-3 el-space-y-2 el-w-full"
      style={{ alignSelf: "start" }}
    >
      <div
        className="el-flex el-w-full"
        style={{
          flexDirection: isUser ? "row-reverse" : "row",
          // justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <div
          className="el-flex el-gap-1 el-items-center el-text-fg/50"
          style={{
            flexDirection: isUser ? "row-reverse" : "row",
            // justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <Icon
            name={isUser ? elllIcons16.activityUser : elllIcons16.ai}
            className="el-h-4 el-w-4"
          />
          <span
            className="el-text-sm"
            style={{
              textTransform: "capitalize",
              lineHeight: 1,
              position: "relative",
              top: 1,
            }}
          >
            {author}
          </span>
        </div>
      </div>
      <div
        style={{
          textAlign: isUser ? "right" : "left",
        }}
      >
        {content.map((c, i) => (
          <MessageContent key={i} content={c} />
        ))}
      </div>
    </div>
  );
});

const MessageContent = memo(function MessageContent({
  content,
}: {
  content: {
    text?: string;
    image_url?: string;
  };
}) {
  if (content.text) {
    return <span>{content.text as any}</span>;
  }

  return <></>;
});

function Thread() {
  const backend = useBackend();
  const [activeTheadId] = useWorkspaceState<string | undefined>(
    "activeThreadId",
  );
  const thread = activeTheadId
    ? backend.instance<IntelligenceThread>(activeTheadId, true)
    : undefined;
  const messagesQuery = thread?.messages({ autoFetch: true });
  const entries = useObservable(messagesQuery?.data$, messagesQuery?.data);
  const loading = useObservable(thread?.messaging$, thread?.messaging);

  return (
    <div className="el-flex el-flex-col el-grow el-overflow-hidden el-gap-2">
      <div className="el-relative el-grow el-overflow-hidden">
        {loading ? (
          <div
            style={{
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <ProgressBar />
          </div>
        ) : null}
        <ScrollArea scrollY containerClassName="el-flex el-flex-col-reverse">
          <div
            style={{
              height: 1,
              overflowAnchor: "auto",
            }}
          />
          {entries?.map((entry, i) => (
            <div key={i} className="el-w-full el-py-3">
              <ThreadEntry entry={entry} />
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
