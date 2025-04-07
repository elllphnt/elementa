import {
  concatLLMContentPart,
  ErrorPayload,
  IntelligenceEvent,
  LLMContent,
  MessageIntent,
  MessagePayload,
} from "@elllphnt/elll-aicp";
import { TokenManager } from "@elllphnt/elll-client";
import { elllEntities } from "@elllphnt/utils";
import { intelligenceServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { IntelligenceThread } from "../resources/intelligence_thread";
import { IntelligenceThreadEntry } from "../resources/intelligence_thread_entry";

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
  get entryStore() {
    return this.backend.store(IntelligenceThreadEntry);
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

  async fetchEntries({
    thread_id,
    cursor,
    limit,
  }: {
    thread_id: string;
    cursor?: string;
    limit: number;
  }) {
    const result = await this.intelligenceServiceClient.get(
      "/intelligence/threads/{thread_id}/entries",
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
        return this.entryStore.push(message);
      }) ?? []
    );
  }

  async handleIntelligenceEvent(event: IntelligenceEvent) {
    switch (event.type) {
      case "message.start": {
        this.entryStore.push({
          id: event.payload.entry_id,
          type: "message",
          entity: elllEntities.intelligenceThreadEntry.name,
          thread_id: event.payload.thread_id,
          data: event.payload.data as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        break;
      }
      case "message.delta": {
        let entry = this.entryStore.instance(event.payload.entry_id);
        if (!entry) {
          entry = this.entryStore.push({
            id: event.payload.entry_id,
            type: "message",
            entity: elllEntities.intelligenceThreadEntry.name,
            thread_id: event.payload.thread_id,
            data: event.payload.delta as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          if (entry.type === "message") {
            const newData: MessagePayload = {
              ...entry.data,
              content: concatLLMContentPart(
                entry.data.content || [],
                event.payload.delta.content || [],
              ),
            };

            if (event.payload.delta.intent) {
              newData.intent = event.payload.delta.intent;
            }

            entry.setData(newData);
          }
        }
        break;
      }
      case "action.start": {
        let entry = this.entryStore.instance(event.payload.entry_id);
        if (!entry) {
          entry = this.entryStore.push({
            id: event.payload.entry_id,
            type: "action",
            entity: elllEntities.intelligenceThreadEntry.name,
            thread_id: event.payload.thread_id,
            data: event.payload.data as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          if (entry.type === "message") {
            entry.setData(event.payload.data);
          }
        }
        break;
      }
      case "action.update": {
        const entry = this.entryStore.instance(event.payload.entry_id);
        if (entry && entry.type === "action") {
          entry.setData({
            ...entry.data,
            ...event.payload.update,
          });
        }
        break;
      }
      case "error": {
        this.handleStreamError(event.payload);
        break;
      }
    }
  }
  async handleStreamError(error: ErrorPayload) {
    console.error("Error:", error.message);
  }

  async postMessage({
    threadId,
    content,
  }: {
    threadId: string;
    content?: LLMContent;
    intent?: MessageIntent;
  }) {
    const tokenManager = this.backend.getProperty(
      "elllephantApiTokenManager",
    ) as TokenManager;
    const baseUrl = "http://localhost:32989"; //this.backend.getProperty("elllephantApiBaseUrl") as string;
    const url = `${baseUrl}/intelligence/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${await tokenManager.getToken()}`,
        },
        body: JSON.stringify({ thread_id: threadId, content, stream: true }),
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
              this.handleIntelligenceEvent(parsedChunk),
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
