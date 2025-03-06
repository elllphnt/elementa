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
  let client = elll.config<AxiosInstance>(configs.elllephant.client);
  if (client) {
    return client;
  }

  const baseUrl = elll.config<string>(configs.elllephant.url);
  const tokenManager = elll.config<TokenManager>(
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

  elll.setConfig(configs.elllephant.client, client);
  return client;
}

export type ToolDef = {
  name: string;
  description: string;
  parameters: any;
  handler: (args: any) => Promise<any>;
};
export async function queryIntelligence({
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
    "/intelligence/completions",
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

    return queryIntelligence({
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
