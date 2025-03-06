import { AxiosInstance } from "axios";
import { queryIntelligence } from "./utils";

const instructions = ({ projectTypes }: { projectTypes: string[] }) => `
You will be given a query from a user willing to build a Website or Webapp project.
Your task is to understand the query and provide a detailed description of the project the user wants to build.

Follow these steps to complete the task:

1. Determine the type of project the user wants to build.
Based on the query, decide whether the user wants to build a project of the following types:
${projectTypes.map((type) => `- ${type}`).join("\n")}

If the user wants to build a project of a different type, set the type to 'other'.
If the query is invalid or unclear, set the type to 'invalid'.

2. Provide a title for the project.
Based on the query, come up with a title that best describes the project.

3. Provide a detailed description of the project.
Enrich the query with additional details to provide a clear and detailed description of the project the user wants to build.
Make sure the description length is between 250 and 500 characters.
For 'other' and 'invalid' project types, return an empty string as description.
`;

export async function buildPrompt({
  query,
  projectTypes,
  client,
}: {
  query: string;
  projectTypes: Array<{
    type: string;
    description: string;
  }>;
  client: AxiosInstance;
}) {
  const response = await queryIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions({
          projectTypes: projectTypes.map(
            (type) => `${type.type}: ${type.description}`,
          ),
        }),
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-4o-mini",
    schema: {
      name: "ProjectPrompt",
      schema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "The type of project the user wants to build.",
            enum: [
              ...projectTypes.map((type) => type.type),
              "other",
              "invalid",
            ],
          },
          title: {
            type: "string",
            description: "A title for the project.",
          },
          description: {
            type: "string",
            description: "A detailed description of the project.",
          },
        },
        required: ["type", "title", "description"],
        additionalProperties: false,
      },
    },
    client,
  });

  return JSON.parse(response) as {
    type: string;
    title: string;
    description: string;
  };
}
