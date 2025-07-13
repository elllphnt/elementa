import type { LinkData } from "@elllphnt/elementa-base";
import { generateDynamic } from "~/generators/component/misc/dynamic.js";
import { generateClassNames } from "./classname.js";

export function applyLink({
  link,
  content,
}: {
  link: LinkData;
  content: string;
}): string {
  const props: Record<string, string> = {};

  if (link.classNames?.length) {
    props["className"] = generateClassNames(link.classNames);
  }
  if (link.href) {
    props["href"] = generateDynamic(link.href);
  }
  if (link.hreflang) {
    props["hreflang"] = generateDynamic(link.hreflang);
  }
  if (link.ping) {
    props["ping"] = generateDynamic(link.ping);
  }
  if (link.referrerPolicy) {
    props["referrerPolicy"] = generateDynamic(link.referrerPolicy);
  }
  if (link.rel) {
    props["rel"] = generateDynamic(link.rel);
  }
  if (link.target) {
    props["target"] = generateDynamic(link.target);
  }
  if (link.params) {
    props["params"] = `{ ${Object.entries(link.params)
      .map(
        ([key, value]) => `${JSON.stringify(key)}: ${generateDynamic(value)}`,
      )
      .join(", ")} }`;
  }
  if (link.query) {
    props["query"] = `{ ${Object.entries(link.query)
      .map(
        ([key, value]) => `${JSON.stringify(key)}: ${generateDynamic(value)}`,
      )
      .join(", ")} }`;
  }
  if (link.state) {
    props["state"] = `{ ${Object.entries(link.state)
      .map(
        ([key, value]) => `${JSON.stringify(key)}: ${generateDynamic(value)}`,
      )
      .join(", ")} }`;
  }

  const propsCode = Object.entries(props)
    .map(([key, val]) => `${key}={${val}}`)
    .join(" ");

  return `<link ${propsCode}>${content}</link>`;
}
