import {
  applyAgentActionUpdate,
  applyAgentMessageDelta,
  ErrorPayload,
} from "@elllphnt/elll-acp";
import { TokenManager } from "@elllphnt/elll-client";
import { ThreadEntry } from "@elllphnt/intelligence-service-client";
import { intelligenceServiceClientFactory } from "../clients";
import {
  IntelligenceEvent,
  IntelligenceMessage,
  queryIntelligence,
} from "../lib/ai";
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
    console.log("Intelligence event:", event);
    switch (event.type) {
      case "message.start": {
        this.entryStore.push(event.payload as unknown as ThreadEntry);
        break;
      }
      case "message.delta": {
        if (!event.payload.id) break;
        let entry = this.entryStore.instance(event.payload.id);
        if (entry?.type === "message") {
          const newData = applyAgentMessageDelta(
            entry.data,
            event.payload.delta,
          );
          entry.setData(newData);
        }
        break;
      }
      case "action.start": {
        this.entryStore.push(event.payload as unknown as ThreadEntry);
        break;
      }
      case "action.update": {
        if (!event.payload.id) break;
        let entry = this.entryStore.instance(event.payload.id);
        if (entry?.type === "action") {
          entry.setData(
            applyAgentActionUpdate(entry.data, event.payload.delta),
          );
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
    message,
  }: {
    threadId: string;
    message: IntelligenceMessage;
  }) {
    const tokenManager = this.backend.getProperty(
      "elllephantApiTokenManager",
    ) as TokenManager;
    const baseUrl = "http://localhost:59365"; //this.backend.getProperty("elllephantApiBaseUrl") as string;
    const url = `${baseUrl}/intelligence/chat`;

    try {
      const stream = queryIntelligence({
        url,
        token: await tokenManager.getToken(),
        thread_id: threadId,
        message,
      });

      for await (const event of stream) {
        this.handleIntelligenceEvent(event);
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
