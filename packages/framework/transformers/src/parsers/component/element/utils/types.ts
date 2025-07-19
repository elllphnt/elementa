import type { ElementData, FragmentData } from "@elllphnt/elementa-base";
import type { Expression, Node } from "ts-morph";
import type { ParseComponentContext } from "../../component/type.js";

export type CreateFragment = ({
  content,
}: {
  content: ElementData[];
}) => FragmentData;

export type ParseElementContext = ParseComponentContext & {
  createFragment: CreateFragment;
  scope: Node;
};

export type ElementAttributeEntry =
  | Expression
  | [string, Expression | undefined];
