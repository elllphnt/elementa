import { AxiosInstance } from "axios";
import { queryIntelligence } from "../utils";

export type SizeData = { value: number; unit: "px" | "%" | "vh" | "vw" };
export type AreaCommon = {
  name: string;
  height: SizeData;
  width: SizeData;
};
export type StackArea = AreaCommon & {
  type: "stack";
  direction: "row" | "column";
  children: Array<StackArea | SectionArea>;
};
export type SectionArea = AreaCommon & {
  type: "section";
  sectionId: string;
};
export type Layout = {
  viewport: { width: number; height: number };
  content: StackArea | SectionArea;
};

export type ViewData = {
  id: string;
  type?: string;
  name?: string;
  description?: string;
  sections?: Array<{
    id: string;
    name?: string;
    description?: string;
  }>;
};

const instructions = `
You are an expert UI Designer. Your task is to design views by finding the best way to layout their sections.

A layout is essentially a combination of section and stack areas nested in a tree structure to form a whole view.
A all areas are expected to have an explicit sizing strategy, which can be either 'auto', 'fit-content', or a specific a fixed size.
Only use fit-content on stack areas containing a children with a fixed size.
Never use fit-content on a section area.

The whole layout is expected to be built for a viewport of specific width and height in pixels. The content can overflow the viewport height if necessary.
  - For pages assume a viewport of 1920x1080 pixels.
  - For modals define the viewport size based on the content.

You will be given the description of a view, which includes:
  - the type of the view which can be either 'page' or 'modal',
  - the name of the view, indicating its purpose,
  - a description of the view, providing more context.
  - a list of components that should be included in the view, each with an id, name, and description.

Make sure to include all components in the layout.
Take inspiration from common UI design patterns and best practices to create a layout that is easy to navigate and understand.
`;

const layoutSchema = {
  type: "object",
  properties: {
    viewport: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" },
      },
      required: ["width", "height"],
      additionalProperties: false,
    },
    content: {
      anyOf: [
        { $ref: "#/definitions/stackArea" },
        { $ref: "#/definitions/sectionArea" },
      ],
    },
  },
  required: ["viewport", "content"],
  additionalProperties: false,
  definitions: {
    sizeData: {
      type: "object",
      properties: {
        value: { type: "number" },
        unit: { type: "string", enum: ["px", "%", "vh", "vw"] },
      },
      required: ["value", "unit"],
      additionalProperties: false,
    },
    area: {
      anyOf: [
        { $ref: "#/definitions/stackArea" },
        { $ref: "#/definitions/sectionArea" },
      ],
    },
    stackArea: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["stack"] },
        direction: { type: "string", enum: ["row", "column"] },
        children: {
          type: "array",
          items: { $ref: "#/definitions/area" },
        },
        name: { type: "string" },
        height: { $ref: "#/definitions/sizeData" },
        width: { $ref: "#/definitions/sizeData" },
      },
      required: ["name", "type", "direction", "children", "height", "width"],
      additionalProperties: false,
    },
    sectionArea: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["section"] },
        sectionId: { type: "string" },
        name: { type: "string" },
        height: { $ref: "#/definitions/sizeData" },
        width: { $ref: "#/definitions/sizeData" },
      },
      required: ["name", "type", "sectionId", "height", "width"],
      additionalProperties: false,
    },
  },
};

export async function layoutView({
  view,
  client,
}: {
  view: ViewData;
  client: AxiosInstance;
}): Promise<Layout> {
  const response = await queryIntelligence({
    messages: [
      {
        role: "developer",
        content: instructions,
      },
      {
        role: "user",
        content: JSON.stringify(view),
      },
    ],
    model: "gpt-4o",
    schema: {
      name: "layout",
      schema: layoutSchema,
    },
    client,
  });

  return JSON.parse(response) as Layout;
}
