export function makeElementaUrl({
  resourceId,
  resourceType,
}: {
  resourceType: string;
  resourceId: string;
}) {
  return `elementa:${resourceType}|${resourceId}`;
}
export function parseElementaUrl(url: string) {
  const key = url.slice("elementa:".length);
  const [resourceType, resourceId] = key.split("|");
  return { resourceType, resourceId };
}

export function makeElementaEntityUrl({
  componentId,
  entityId,
  part,
}: {
  componentId: string;
  entityId: string;
  part?: string;
}) {
  return `elementaentity:${componentId}/${entityId}/${part || ""}`;
}
export function parseElementaEntityUrl(url: string) {
  const key = url.slice("elementaentity:".length);
  const [componentId, entityId, part] = key.split("/");
  return { componentId, entityId, part };
}
