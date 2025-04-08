import { AxiosInstance } from "axios";
import { messageIntelligence } from "../utils";

export type DisplayData = {
  name: string;
  description?: string;
};
export type InteractionData = {
  name: string;
  description?: string;
};
export type LinkData = {
  name: string;
  viewId?: string;
};

// component data

export type AddComponentData = {
  name: string;
  description: string;
  displays: DisplayData[];
  interactions: InteractionData[];
  links: LinkData[];
};
export type UseComponentData = {
  id: string;
  useDisplays: string[];
  useInteractions: string[];
  useLinks: string[];
  addDisplays: DisplayData[];
  addInteractions: InteractionData[];
  addLinks: LinkData[];
};

// view data

export type AddViewData = {
  name: string;
  type: string;
  description: string;
  components: AddComponentData[];
};
export type UseViewData = {
  id: string;
  addComponents: AddComponentData[];
  useComponents: UseComponentData[];
};

// Plan data
export type FeaturePlan = {
  addViews: Array<AddViewData>;
  useViews: Array<UseViewData>;
};

export type ViewData = {
  id: string;
  type?: string;
  name?: string;
  description?: string;
  components?: Array<{
    id: string;
    name?: string;
    description?: string;
    displays?: DisplayData[];
    interactions?: InteractionData[];
    links?: LinkData[];
  }>;
};

const instructions = ({
  type,
  description,
  views,
}: {
  type: string;
  description: string;
  views: Omit<ViewData, "components">[];
}) => `
  You are an expert UX Engineer. Your task is to plan and document the implementation of a new feature for a **${type}** project.
  
  ### Project Overview
  - **Description**: ${description}
  
  ### Key Concepts
  The project consists of views and components, with the following relationships and properties:
  
  - **View**: A navigable container, such as a page or modal.
    - Examples include Home Page, Product Details, Checkout.
    - Contains components that define the building blocks of the view.
  
  - **Component**: A reusable UI section with the following attributes:
    - **Displays**: Visual elements presenting information to the user.
      - **Example**: Product Info, Order Summary, User Profile.
    - **Interactions**: User-triggered actions.
      - **Example**: Add to Cart, Sign In, Place Order.
    - **Links**: Navigation connections between views.
      - **Example**: Clicking on a product navigates to the Product Details view.
  
  ### Existing Views
  Below is a list of existing views in the project:
  \`\`\`json
  ${JSON.stringify(views, null, 2)}
  \`\`\`
  
  ### Guidelines for Planning
  1. **Inspect Existing Views**:
     - Review the current views to understand the project's structure.
     - Identify relevant views for the new feature. For detailed information, call:
       \`getView(id: string)\`. The id of the view can be found in the existing views list.
       If the list is empty, you can assume that no views exist yet.
  
  2. **Reuse or Extend**:
     - Prioritize reusing and extending existing views and components.
     - Use the useViews and useComponents fields for extending existing views or components.
     - Create new views and components only when necessary, using addViews and addComponents.
  
  3. **Create the Plan**:
     - Specify additions and modifications to views and components in a coherent plan.
     - Ensure all aspects of the feature are covered, including displays, interactions, and links.
  
  ### Deliverables
  Return a plan object containing:
  - **addViews**: New views created for the feature.
  - **useViews**: Modifications or extensions to existing views.
  
  Ensure the plan is clear and logical. Focus on reusability and coherence.
  `;

export async function planFeature({
  type,
  description,
  feature,
  tools,
  client,
  views,
}: {
  type: string;
  description: string;
  feature: any;
  tools: {
    getView(id: string): ViewData | undefined;
  };
  client: AxiosInstance;
  views: Omit<ViewData, "components">[];
}): Promise<FeaturePlan> {
  const response = await messageIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions({
          type,
          description,
          views: views.map(({ id, type, name, description }) => ({
            id,
            type,
            name,
            description,
          })),
        }), // Assuming views are empty initially
      },
      {
        role: "user",
        content: JSON.stringify(feature),
      },
    ],
    model: "gpt-4o",
    schema: {
      name: "feature_plan",
      schema: {
        type: "object",
        properties: {
          addViews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["page", "modal"] },
                description: { type: "string" },
                components: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      displays: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      interactions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      links: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            viewId: { type: "string" },
                          },
                          required: ["name", "viewId"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "name",
                      "description",
                      "displays",
                      "interactions",
                      "links",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["name", "type", "description", "components"],
              additionalProperties: false,
            },
          },
          useViews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                addComponents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      displays: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      interactions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      links: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            viewId: { type: "string" },
                          },
                          required: ["name", "viewId"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "name",
                      "description",
                      "displays",
                      "interactions",
                      "links",
                    ],
                    additionalProperties: false,
                  },
                },
                useComponents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      useDisplays: {
                        type: "array",
                        items: { type: "string" },
                      },
                      useInteractions: {
                        type: "array",
                        items: { type: "string" },
                      },
                      useLinks: {
                        type: "array",
                        items: { type: "string" },
                      },
                      addDisplays: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      addInteractions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                          required: ["name", "description"],
                          additionalProperties: false,
                        },
                      },
                      addLinks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            viewId: { type: "string" },
                          },
                          required: ["name", "viewId"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "id",
                      "useDisplays",
                      "useInteractions",
                      "useLinks",
                      "addDisplays",
                      "addInteractions",
                      "addLinks",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "addComponents", "useComponents"],
              additionalProperties: false,
            },
          },
        },
        required: ["addViews", "useViews"],
        additionalProperties: false,
      },
    },
    tools: [
      {
        name: "getView",
        description: "Get a view by its ID",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
          additionalProperties: false,
        },
        handler: async ({ id }: { id: string }) => {
          const view = tools.getView(id);
          if (view) {
            return view;
          } else {
            return { error: "View not found" };
          }
        },
      },
    ],
    client,
  });

  return JSON.parse(response) as FeaturePlan;
}
