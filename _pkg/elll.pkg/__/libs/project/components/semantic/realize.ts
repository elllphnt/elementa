import {
  SemanticComponentData,
  SemanticElementData,
} from "@elllphnt/elll-intelligence";
import {
  ComponentData,
  ElementData,
  entityTypes,
  FrameWidgetData,
} from "@repo/elementa";
import { componentRealizer } from "./realizers/components";
import {
  elementRealizer,
  logoVectorElementRealizer,
  textElementRealizer,
  vectorElementRealizer,
} from "./realizers/elements";
import { pageRealizer } from "./realizers/pages";
import { sectionRealizer } from "./realizers/sections";

export async function realizeSemanticComponent(
  id: string,
  data: SemanticComponentData,
): Promise<ComponentData> {
  let content = [];

  const element = realizeSemanticElement(data.template);
  if (element) {
    content.push(element);
  }

  return {
    _id: id,
    template: {
      type: entityTypes.fragment,
      content,
    },
    widgets: [
      {
        type: entityTypes.widgets.frame,
        x: 0,
        y: 0,
        viewport: {
          width: 1280,
          height: 720,
        },
      } as FrameWidgetData,
    ],
  };
}

export function realizeSemanticElement(
  data: SemanticElementData,
): ElementData | undefined {
  const realizer = getRealiser(data.semantic ?? "element") ?? elementRealizer;
  if (realizer) {
    return realizer(data);
  } else {
    alert("No realizer found for semantic element: " + data.semantic);
  }
}

function getRealiser(
  semantic: string,
): ((data: SemanticElementData) => ElementData) | undefined {
  let semanticParts = semantic.split(".");
  while (semanticParts.length) {
    const realizer = semanticElementRealizers[semanticParts.join(".")];
    if (realizer) {
      return realizer;
    }
    semanticParts.pop();
  }
}

const semanticElementRealizers: Record<
  string,
  (data: SemanticElementData) => ElementData
> = {
  "element": elementRealizer,
  "element.vector": vectorElementRealizer,
  "element.vector.logo": logoVectorElementRealizer,
  "element.text": textElementRealizer,
  "component": componentRealizer,
  "section": sectionRealizer,
  "page": pageRealizer,
};
