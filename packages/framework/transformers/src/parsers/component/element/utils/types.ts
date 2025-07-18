import type {
  ElementData,
  FragmentData,
  StyleClassData,
} from "@elllphnt/elementa-base";
import type { Expression, Node } from "ts-morph";

export type CreateFragment = ({
  content,
}: {
  content: ElementData[];
}) => FragmentData;

export type ParseElementContext = {
  createFragment: CreateFragment;
  getStyleClass: ({
    id,
    classes,
  }: {
    id?: string;
    classes?: (string | [string, string])[];
  }) => StyleClassData;
  scope: Node;
};

export type ElementAttributeEntry =
  | Expression
  | [string, Expression | undefined];
