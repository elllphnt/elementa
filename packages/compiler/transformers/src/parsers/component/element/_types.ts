import type { ElementData, FragmentData } from "@elllphnt/elementa-base";
import type { Expression, Node } from "ts-morph";

export type CreateFragment = ({
  content,
}: {
  content: ElementData[];
}) => FragmentData;

export type ParseElementContext = {
  createFragment: CreateFragment;
  scope: Node;
};

export type ElementAttributeEntry =
  | Expression
  | [string, Expression | undefined];
