import { ElementData, FragmentData } from "@elllphnt/elementa-base";

export type CreateFragment = ({
  content,
}: {
  content: ElementData[];
}) => FragmentData;
