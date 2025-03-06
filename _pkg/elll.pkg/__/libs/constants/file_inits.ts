import { elllFileTypes } from "@elllphnt/utils";
import { ComponentData } from "@repo/elementa";

export function componentFileInit({ id, name }: { id: string; name: string }) {
  const componentData: ComponentData = {};

  return JSON.stringify(componentData);
}
export function pageFileInit({
  id,
  name,
  path,
}: {
  id: string;
  name: string;
  path?: string;
}) {
  const componentData: ComponentData = {};

  return JSON.stringify(componentData);
}

export function initFileContent({
  id,
  type,
  name,
  path,
}: {
  id: string;
  type: string;
  name: string;
  path: string;
}) {
  switch (type) {
    case elllFileTypes.components.elll:
      return componentFileInit({ id: id, name });
    default:
      return "";
  }
}
