import { IntelligenceMessage, IntelligenceThread } from "@repo/backend";
import {
  ActionBar,
  ActionRegistry,
  elllIcons16,
  ProgressBar,
  ScrollArea,
  useControlMenu,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { memo, useMemo, useState } from "react";
import AutosizeTextArea from "react-textarea-autosize";
import {
  componentEditor,
  ElementaEditorState,
} from "~/src/editors/elementa/editor";
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
      <Input />
      <Thread />
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
    let thread = activeTheadId
      ? backend.instance<IntelligenceThread>(activeTheadId, true)
      : undefined;

    if (!thread) {
      if (!workspace) return;
      thread = await workspace.createIntelligenceThread();
      if (thread) {
        setActiveThreadId(thread.id);
      }
    }

    thread?.postMessage({
      content: message,
      onRequest: async (request) => {
        const result: Record<string, any> = {};
        for (const call of request.tool_calls) {
          elll.shell.toast(JSON.stringify(call));
          switch (call.tool) {
            case "get_content": {
              const editor = elll.shell.workspace?.activeEditor;
              if (editor?.editorId === componentEditor.id) {
                const componentEditor = editor as ElementaEditorState;
                const content = componentEditor.componentModel?.data.template;
                result[call.id] = content
                  ? { status: "success", content }
                  : { status: "empty" };
              } else {
                console.log("onRequest", "No editor", editor);
                result[call.id] = { status: "error", error: "No editor" };
              }
              break;
            }
            case "editor_insert_element": {
              const editor = elll.shell.workspace?.activeEditor;
              // if (editor?.editorId === componentEditor.id) {
              //   const componentEditor = editor as ElementaEditorState;
              //   const component = componentEditor.componentModel;
              //   if (!component) {
              //     result[call.id] = { status: "error", error: "No component" };
              //     break;
              //   } else {
              //     let args = call.args;
              //     const entity = component.entity(args.container);
              //     if (!entity || !(entity instanceof Element)) {
              //       result[call.id] = {
              //         status: "error",
              //         error: "Entity not found",
              //       };
              //       break;
              //     }
              //     let container: ElementContainer | undefined = entity as any;
              //     if (!(container instanceof ElementContainer)) {
              //       container = entity.container || component.template;
              //     }

              //     const element = component.createElement({
              //       type: entityTypes.elements.text,
              //     }) as TextElement;
              //     element.setContent(JSON.stringify(args.element));

              //     container.appendElements(element);
              //     result[call.id] = { status: "success" };
              //   }
              // }
              break;
            }
            default: {
              result[call.id] = {
                status: "error",
                error: "Unsupported method.",
              };
              break;
            }
          }
        }

        console.log("onRequest", request, result);

        return result;
      },
    });
  };

  const handleSubmit = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <div
      className="el-bg-bg-100/50 el-border-b"
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
      <div className="el-flex el-items-center el-justify-between el-w-full el-pb-1 el-px-2 el-justify-end">
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

const Message = memo(function Message({
  message,
}: {
  message: IntelligenceMessage;
}) {
  const content = useObservable(message.content$, message.content);
  const author = useObservable(message.role$, message.role);
  const isUser = author?.toLowerCase() === "user";

  return (
    <div className="el-p-3 el-space-y-3" style={{ alignSelf: "start" }}>
      <div
        className="el-flex el-w-full"
        style={{
          flexDirection: isUser ? "row-reverse" : "row",
          // justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <div
          className="el-flex el-gap-2 el-items-center"
          style={{
            flexDirection: isUser ? "row-reverse" : "row",
            // justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <div className="el-h-5 el-w-5 el-rounded-full el-bg-bg-100/50 el-flex el-items-center el-border" />
          <span
            className="el-text-sm el-text-fg/50"
            style={{ textTransform: "capitalize" }}
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
    type?: string;
    text?: string;
    image_url?: string;
  };
}) {
  if (content.type === "text") {
    return <span>{content.text as any}</span>;
  } else if (content.type === "image_url") {
    return <img src={content.image_url} alt="image" />;
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
  const messages = useObservable(messagesQuery?.data$, messagesQuery?.data);
  const loading = useObservable(thread?.messaging$, thread?.messaging);

  return (
    <div className="el-flex el-flex-col el-grow el-overflow-hidden el-gap-2">
      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY>
          {loading ? (
            <div
              style={{
                position: "absolute",
                top: -1,
                left: 0,
                right: 0,
                zIndex: 10,
              }}
            >
              <ProgressBar />
            </div>
          ) : (
            <></>
          )}
          {messages?.map((message, i) => (
            <>
              {i > 0 ? <hr /> : <></>}
              <Message key={i} message={message} />
            </>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
