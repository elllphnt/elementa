import { TokenManager } from "@elllphnt/elll-client";
import axios, { AxiosInstance } from "axios";
import { configs } from "~/src/libs/configs";
import { IElll } from "~/src/types/elll";

export type DeveloperMessageData = {
  role: "developer";
  content: string;
  name?: string;
};
export type UserMessageData = {
  role: "user";
  content: string;
  name?: string;
};
export type AssistantMessageData = {
  role: "assistant";
  content?: string;
  tool_calls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
};
export type ToolMessageData = {
  role: "tool";
  content: string;
  tool_call_id: string;
};
export type ChatMessageData =
  | DeveloperMessageData
  | UserMessageData
  | AssistantMessageData
  | ToolMessageData;

export type JsonSchema = {
  name: string;
  schema: any;
};

export function getElllephantApiClient(elll: IElll) {
  let client = elll.property<AxiosInstance>(configs.elllephant.client);
  if (client) {
    return client;
  }

  const baseUrl = elll.property<string>(configs.elllephant.url);
  const tokenManager = elll.property<TokenManager>(
    configs.elllephant.tokenManager,
  );

  if (!baseUrl || !tokenManager) {
    throw new Error("Elllephant API client not configured");
  }

  client = axios.create({
    baseURL: baseUrl,
  });
  client.interceptors.request.use(async (config) => {
    const token = await tokenManager.getToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  elll.setProperty(configs.elllephant.client, client);
  return client;
}

export type ToolDef = {
  name: string;
  description: string;
  parameters: any;
  handler: (args: any) => Promise<any>;
};

export const aiModels = {
  gemini_2_5_pro: "gemini-2.5-pro-exp-03-25",
  gemini_2_0_flash: "gemini-2.0-flash-001",
  o3_mini: "o3-mini",
  gpt_4o_mini: "gpt-4o-mini",
  deepseek_r1: "deepseek-r1",
  deepseek_v3: "deepseek-v3",
} as const;
export type AIModelCode = (typeof aiModels)[keyof typeof aiModels];

export async function messageIntelligence({
  messages,
  client,
  model,
  schema,
  tools,
}: {
  messages: ChatMessageData[];
  model: string;
  schema?: JsonSchema;
  client: AxiosInstance;
  tools?: ToolDef[];
}) {
  const response = await client.post<AssistantMessageData>(
    "/intelligence/query",
    {
      messages,
      model,
      schema: {
        ...schema,
        strict: true,
      },
      tools: tools?.map((tool) => ({
        name: tool.name,
        parameters: tool.parameters,
        description: tool.description,
        strict: true,
      })),
    },
  );

  if (response.data.tool_calls?.length) {
    const newMessages: ChatMessageData[] = [...messages, response.data];

    for (const toolCall of response.data.tool_calls) {
      const tool = tools?.find((tool) => tool.name === toolCall.function.name);
      if (tool) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await tool.handler(args);
        newMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        });
      }
    }

    return messageIntelligence({
      messages: newMessages,
      model,
      schema,
      client,
      tools,
    });
  } else {
    return response.data.content ?? "";
  }
}
export async function queryIntelligence({
  instructions,
  query,
  model,
  schema,
  format,
  client,
}: {
  instructions: string;
  query: string;
  model?: AIModelCode;
  schema?: any;
  format?: "json" | "text";
  client: AxiosInstance;
}) {
  const response = await client.post<string>("/intelligence/query", {
    instructions,
    query,
    model,
    schema,
    format,
  });

  return response.data;
}
