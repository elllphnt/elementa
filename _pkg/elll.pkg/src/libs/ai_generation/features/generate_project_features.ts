import { AxiosInstance } from "axios";
import { FeatureData } from "~/src/modules/elementa/spec/_types";
import { queryIntelligence } from "../utils";

const instructions = ({ type }: { type: string }) => `
You will be given the description of a ${type} project.
Your task is to:

1. Understand the requirements of the project based on the provided description.
2. Generate a comprehensive list of features that the project should implement.
   - Each feature should align with the project's purpose, target audience, and functionality.
   - Make sure to include all features that are necessary for the project to be successful and meet the requirements outlined in the description.
   - Structure the list to ensure clarity and logical flow, prioritizing core features first.

Your output should be concise, accurate, and tailored to the project's described objectives.
Only generate functional features that are relevant to the project's scope and purpose.
Do not include UI/UX related features or design elements in your response.

Make sure the resulting the resulting list as a whole is coherent and covers all the necessary aspects of the project.
`;

export async function generateProjectFeatures({
  type,
  description,
  client,
}: {
  type: string;
  description: string;
  client: AxiosInstance;
}) {
  const response = await queryIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions({ type: type }),
      },
      {
        role: "user",
        content: description,
      },
    ],
    model: "gpt-4o-mini",
    schema: {
      name: "project_features",
      schema: {
        type: "object",
        properties: {
          features: {
            type: "array",
            items: {
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
        },
        required: ["features"],
        additionalProperties: false,
      },
    },
    client,
  });

  return JSON.parse(response).features as Omit<FeatureData, "id">[];
}
