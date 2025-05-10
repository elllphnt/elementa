import {
  ComponentCompilerContext,
  ElementCompilerMeta,
  ElementData,
} from "../../../../types/_.js";

export function applyLinkMeta(
  element: ElementData,
  context: ComponentCompilerContext,
  meta: ElementCompilerMeta
) {
  if (!element.link?.href) {
    return meta;
  } else {
    let props: Record<string, string> = {};

    if (element.link.href) {
      props.href = element.link.href as string;
    }
    if (element.link.target) {
      props.target = element.link.target as string;
    }

    return { ...meta, tag: "a", props: { ...meta.props, ...props } };
  }
}
