import { AxiosInstance } from "axios";
import { DomainData } from "~/src/modules/elementa/programming_interface/_types";
import { FeatureData } from "~/src/modules/elementa/spec/_types";
import { queryIntelligence } from "../utils";

const instructions = ({
  type,
  description,
  domains,
}: {
  type: string;
  description: string;
  domains: DomainData[];
}) => `
You will be given a list of features that need to be organized into domains for a ${type} project.

This is the description of the project:
${description}

These are the existing domains in the project:
${JSON.stringify(domains, null, 2)}

In your response, you should return a list of assignments that map each feature to a domain.
Assign each feature to the domain that best represents its functionality and purpose.

If necessary, you can create new domains and provide a name and description for each one.
Only create new domains if the existing ones do not accurately represent the features.

Your output should be structured and organized to ensure clarity and logical grouping of features.
`;

export async function organizeFeatures({
  type,
  description,
  domains,
  features,
  client,
}: {
  type: string;
  description: string;
  domains: DomainData[];
  features: FeatureData[];
  client: AxiosInstance;
}) {
  type Result = {
    newDomains: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    assignments: Array<{
      featureId: string;
      domainId: string;
    }>;
  };
  const response = await queryIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions({
          type,
          description,
          domains,
        }),
      },
      {
        role: "user",
        content: JSON.stringify(features, null, 2),
      },
    ],
    model: "gpt-4o-mini",
    schema: {
      name: "project_features",
      schema: {
        type: "object",
        properties: {
          newDomains: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The id of the domain",
                },
                name: {
                  type: "string",
                  description: "The name of the domain",
                },
                description: {
                  type: "string",
                  description: "A description of the domain",
                },
              },
              required: ["id", "name", "description"],
              additionalProperties: false,
            },
          },
          assignments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                featureId: {
                  type: "string",
                  description: "The id of the feature",
                },
                domainId: {
                  type: "string",
                  description: "The id of the domain",
                },
              },
              required: ["featureId", "domainId"],
              additionalProperties: false,
            },
          },
        },
        required: ["newDomains", "assignments"],
        additionalProperties: false,
      },
    },
    client,
  });

  return JSON.parse(response) as Result;
}
