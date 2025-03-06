import { TokenManager } from "@elllphnt/elll-client";
import { Message } from "@elllphnt/intelligence-service-client";
import { elllEntities } from "@elllphnt/utils";
import { intelligenceServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { IntelligenceThread } from "../resources/intelligence_thread";
import { IntelligenceMessage } from "../resources/intelligence_thread_message";

export type MessageContent = {
  index?: number;
  type?: string;
  text?: string;
  image_url?: string;
};

export type RequestToolCall = {
  id: string;
  tool: string;
  args: Record<string, any>;
};
export type Request = {
  thread_id: string;
  tool_calls: RequestToolCall[];
};
export type RequestHandler = (request: Request) => Promise<Record<string, any>>;

export type RequestEvent = {
  type: "thread.request";
  data: Request;
};
export type MessageStartEvent = {
  type: "thread.message.start";
  data: Message;
};
export type MessageDeltaEvent = {
  type: "thread.message.delta";
  data: {
    id: string;
    thread_id: string;
    role?: "assistant" | "user" | "system" | "tool";
    content?: string;
    name?: string;
  };
};
export type MessageEndEvent = {
  type: "thread.message.end";
  data: Message;
};
export type ErrorEvent = {
  type: "error";
  data: {
    name: string;
    message: string;
    details?: Record<string, any>;
  };
};

export type EventData =
  | RequestEvent
  | MessageStartEvent
  | MessageDeltaEvent
  | MessageEndEvent
  | ErrorEvent;

export class IntelligenceService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  // clients

  get intelligenceServiceClient() {
    return this.backend.client(intelligenceServiceClientFactory);
  }

  // stores

  get threadStore() {
    return this.backend.store(IntelligenceThread);
  }
  get messageStore() {
    return this.backend.store(IntelligenceMessage);
  }

  // Thread

  async fetchThread(thread_id: string) {
    const result = await this.intelligenceServiceClient.get(
      "/intelligence/threads/{thread_id}",
      {
        params: {
          path: {
            thread_id,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw new Error(result.response.statusText);
    }

    if (result.data) {
      return this.threadStore.push(result.data);
    }
  }
  async fetchThreads({
    tenant_id,
    cursor,
    limit,
    metadata,
  }: {
    tenant_id: string;
    cursor?: string;
    limit: number;
    metadata?: Record<string, any>;
  }) {
    const result = await this.intelligenceServiceClient.get(
      "/intelligence/threads",
      {
        params: {
          query: {
            tenant_id,
            cursor,
            limit,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw new Error(result.response.statusText);
    }

    return (
      result.data?.map((thread) => {
        return this.threadStore.push(thread);
      }) ?? []
    );
  }
  async updateThread(
    thread_id: string,
    data: {
      title?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const result = await this.intelligenceServiceClient.patch(
      "/intelligence/threads/{thread_id}",
      {
        params: {
          path: {
            thread_id,
          },
        },
        body: {
          title: data.title!,
          metadata: data.metadata as any,
        },
      },
    );

    if (!result.response.ok) {
      throw new Error(result.response.statusText);
    }

    if (result.data) {
      return this.threadStore.push(result.data);
    }
  }
  async createThread(data: {
    tenant_id: string;
    title?: string;
    assistant?: string;
    metadata?: Record<string, any>;
  }) {
    const result = await this.intelligenceServiceClient.post(
      "/intelligence/threads",
      {
        body: {
          title: data.title,
          tenant_id: data.tenant_id,
          assistant: data.assistant ?? "copilot",
          metadata: data.metadata as any,
        },
      },
    );

    if (!result.response.ok) {
      throw new Error(result.response.statusText);
    }

    if (result.data) {
      return this.threadStore.push(result.data);
    }
  }
  async deleteThread(thread_id: string) {
    const result = await this.intelligenceServiceClient.delete(
      "/intelligence/threads/{thread_id}",
      {
        params: {
          path: {
            thread_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw new Error(result.response.statusText);
    }

    this.threadStore.remove(thread_id);
  }

  // Message

  async fetchMessages({
    thread_id,
    cursor,
    limit,
  }: {
    thread_id: string;
    cursor?: string;
    limit: number;
  }) {
    const result = await this.intelligenceServiceClient.get(
      "/intelligence/threads/{thread_id}/messages",
      {
        params: {
          path: {
            thread_id,
          },
          query: {
            cursor,
            limit,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw new Error(result.response.statusText);
    }

    return (
      result.data?.map((message) => {
        return this.messageStore.push(message);
      }) ?? []
    );
  }
  async handleStreamEvent(event: EventData, onRequest: RequestHandler) {
    console.log("Stream event:", event);
    switch (event.type) {
      case "thread.message.start": {
        this.messageStore.push(event.data);
        break;
      }
      case "thread.message.end": {
        this.messageStore.push(event.data);
        console.log("Message end", this.messageStore);
        break;
      }
      case "thread.message.delta": {
        let message = this.messageStore.instance(event.data.id);
        if (!message) {
          message = this.messageStore.push({
            id: event.data.id,
            entity: elllEntities.intelligenceMessage.name,
            thread_id: event.data.thread_id,
            content: [
              {
                type: "text",
                text: event.data.content ?? "",
              },
            ],
            role: event.data.role!,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          console.log("Updating existing message", event.data.id);
          message.concatContent([
            {
              type: "text",
              text: event.data.content ?? "",
            },
          ]);
        }

        break;
      }
      case "thread.request": {
        if (onRequest) {
          const result = await onRequest(event.data);
          this.postMessage({
            threadId: event.data.thread_id,
            answers: result,
            onRequest,
          });
        }
        break;
      }
      case "error": {
        this.handleStreamError(event.data, onRequest);
      }
    }
  }
  async handleStreamError(
    error: ErrorEvent["data"],
    onRequest: RequestHandler,
  ) {
    console.log("Stream error:", error);
    switch (error.name) {
      case "answers_required_error":
        const request = error.details?.request as Request;
        if (request) {
          const result = await onRequest(request);
          this.postMessage({
            threadId: error.details!.thread_id,
            answers: result,
            onRequest,
          });
        } else {
          console.error("Request not found in answers_required_error details");
        }
        break;
      case "unexpected_error":
        console.error("Unexpected error:", error.message);
        break;
      default:
        console.error("Error:", error.message);
    }
  }

  async postMessage({
    threadId,
    content,
    answers,
    onRequest,
  }: {
    threadId: string;
    content?: string;
    answers?: Record<string, string>;
    onRequest: (request: Request) => any;
  }) {
    if (!content && !answers) {
      throw new Error("Answer or content is required");
    }

    // Make a POST request to the streaming endpoint
    const tokenManager = this.backend.getProperty(
      "elllephantApiTokenManager",
    ) as TokenManager;
    const baseUrl = this.backend.getProperty("elllephantApiBaseUrl") as string;
    const url = `${baseUrl}/intelligence/threads/${threadId}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${await tokenManager.getToken()}`,
        },
        body: JSON.stringify({ content, answers, stream: true }),
      });

      if (!response.body) {
        throw new Error(
          "ReadableStream not supported or response body is empty.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunkStr = decoder.decode(value);
          try {
            const parts = chunkStr
              .split("\n")
              .map((part) => part.trim())
              .filter(Boolean);
            const parsedChunks = parts.map((part) => JSON.parse(part));
            parsedChunks.forEach((parsedChunk) =>
              this.handleStreamEvent(parsedChunk, onRequest),
            );
          } catch (error) {
            console.error("Error parsing chunk:", error, "Chunk:", chunkStr);
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
    }
  }
}

export const intelligenceServiceFactory = createConstructorFactory(
  IntelligenceService,
  {
    name: "intelligence-service",
  },
);
