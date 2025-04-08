import { AxiosInstance } from "axios";
import { queryIntelligence } from "./utils";

const instructions = ({ projectTypes }: { projectTypes: string[] }) => `
You will be given a query from a user willing to build a software project.
Your task is to understand the query and provide a detailed description of the project the user wants to build.

Follow these steps to complete the task:

1. Determine the type of project the user wants to build.
Based on the query, decide whether the user wants to build a project of the following types:
${projectTypes.map((type) => `- ${type}`).join("\n")}

If the user wants to build a project of a different type, set the type to 'other'.
If the query is invalid or unclear, set the type to 'invalid'.

2. Provide a title for the project.
Based on the query, come up with a title that best describes the project.

OUTPUT FORMAT:
{
  "type": "<project_type>",
  "title": "<project_title>"
}
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
    instructions: instructions({
      projectTypes: projectTypes.map(
        (type) => `${type.type}: ${type.description}`,
      ),
    }),
    query,
    client,
    format: "json",
  });

  return JSON.parse(response) as {
    type: string;
    title: string;
  };
}
