import {
  ElementData,
  entityTypes,
  switchEntityType,
} from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../../types/component.js";
import { applyLinkMeta } from "./_/link.js";
import { compileComponentElement } from "./component.js";
import { compileContainerElement } from "./container.js";
import { compileMediaElement } from "./media.js";
import { compileTextElement } from "./text.js";
import { compileVectorElement } from "./vector.js";

export function compileElement(
  data: ElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): string {
  let _meta = meta || {};
  if (data.link) {
    _meta = applyLinkMeta(data, context, _meta);
  }

  return switchEntityType(data.type, {
    [entityTypes.elements.container]: () => {
      return compileContainerElement(data, context, _meta);
    },
    [entityTypes.elements.text]: () => {
      return compileTextElement(data, context, _meta);
    },
    [entityTypes.elements.media]: () => {
      return compileMediaElement(data, context, _meta);
    },
    [entityTypes.elements.component]: () => {
      return compileComponentElement(data, context, _meta);
    },
    [entityTypes.elements.vector]: () => {
      return compileVectorElement(data, context, _meta);
    },
  });
}
