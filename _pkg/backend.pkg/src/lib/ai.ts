import {
  AgentAction,
  AgentActionUpdate,
  AgentMessage,
  AgentMessageDelta,
  ErrorPayload,
} from "@elllphnt/elll-acp";
import { ThreadEntry } from "@elllphnt/intelligence-service-client";

export type ThreadEntryPayload<T> = Omit<ThreadEntry, "data"> & {
  data: T;
};
export type ThreadEntryPartialPayload<T> = Partial<
  Omit<ThreadEntry, "data" | "created_at" | "updated_at">
> & {
  delta: T;
};

export type IntelligenceMessage = AgentMessage;
export type IntelligenceMessageDelta = AgentMessageDelta;
export type IntelligenceAction = AgentAction;
export type IntelligenceActionUpdate = AgentActionUpdate;

export type IntelligenceBaseEvent = {
  type: string;
  timestamp: number;
};
export type IntelligenceMessageStartEvent = IntelligenceBaseEvent & {
  type: "message.start";
  payload: ThreadEntryPayload<IntelligenceMessage>;
};
export type IntelligenceMessageDeltaEvent = IntelligenceBaseEvent & {
  type: "message.delta";
  payload: ThreadEntryPartialPayload<IntelligenceMessageDelta>;
};
export type IntelligenceMessageEndEvent = IntelligenceBaseEvent & {
  type: "message.end";
  payload: ThreadEntryPayload<IntelligenceMessage>;
};

export type IntelligenceActionStartEvent = IntelligenceBaseEvent & {
  type: "action.start";
  payload: ThreadEntryPayload<IntelligenceAction>;
};
export type IntelligenceActionUpdateEvent = IntelligenceBaseEvent & {
  type: "action.update";
  payload: ThreadEntryPartialPayload<IntelligenceActionUpdate>;
};
export type IntelligenceActionEndEvent = IntelligenceBaseEvent & {
  type: "action.end";
  payload: ThreadEntryPayload<IntelligenceAction>;
};

export type IntelligenceErrorEvent = IntelligenceBaseEvent & {
  type: "error";
  payload: ErrorPayload;
};

export type IntelligenceEvent =
  | IntelligenceMessageStartEvent
  | IntelligenceMessageDeltaEvent
  | IntelligenceMessageEndEvent
  | IntelligenceActionStartEvent
  | IntelligenceActionUpdateEvent
  | IntelligenceActionEndEvent
  | IntelligenceErrorEvent;

export async function* queryIntelligence({
  url,
  token,
  thread_id,
  message,
}: {
  url: string;
  token: string;
  thread_id: string;
  message: Omit<IntelligenceMessage, "role">;
}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      thread_id,
      message: {
        ...message,
        role: "user",
      },
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    buffer = lines.pop() || ""; // keep partial line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed) as IntelligenceEvent;
      } catch {
        continue;
      }
    }
  }

  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer.trim()) as IntelligenceEvent;
    } catch {}
  }
}
