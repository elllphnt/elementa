import { AxiosInstance } from "axios";
import { queryIntelligence } from "../utils";

const instructions = ({
  type,
  description,
  features,
}: {
  type: string;
  description: string;
  features: any[];
}) => `
The following is the description of a ${type} project, followed by a list of features of the project.

*** Description ***
${description}

*** Features ***
${features.map((feature) => `**${feature.name}**: ${feature.description}`).join("\n")}

You will be given the description of an additional feature. Provide a name and description for the feature, considering the context of the project.
`;

export async function parseProjectFeature({
  query,
  type,
  description,
  features,
  client,
}: {
  query: string;
  type: string;
  description: string;
  features: any[];
  client: AxiosInstance;
}) {
  const response = await queryIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions({
          type: type,
          description,
          features,
        }),
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-4o-mini",
    schema: {
      name: "project_feature",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the feature",
          },
          description: {
            type: "string",
            description: "A description of what the feature does",
          },
        },
        required: ["name", "description"],
        additionalProperties: false,
      },
    },
    client,
  });

  return JSON.parse(response);
}
