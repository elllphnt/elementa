// entity
export function makeElementaEntityResourceId({
  componentUrl,
  entityId,
}: {
  componentUrl: string;
  entityId: string;
}) {
  return `${encodeURIComponent(componentUrl)}:${entityId}`;
}
export function parseElementaEntityResourceId(resourceId: string) {
  const [componentUrl, ...entityId] = resourceId.split(":");
  if (!componentUrl || !entityId.length) {
    console.error(`Invalid entity resource id: ${resourceId}`);
    return undefined;
  }

  return {
    componentUrl: decodeURIComponent(componentUrl),
    entityId: entityId.join(":"),
  };
}

// url
export function makeElementaUrl({
  resourceType,
  resourceId,
}: {
  resourceType: string;
  resourceId: string;
}) {
  return `elementa:${resourceType}:${resourceId}`;
}
export function isElementaUrl(url: string) {
  return url.startsWith("elementa:");
}
export function parseElementaUrl(url: string) {
  if (!isElementaUrl(url)) {
    console.error(`Invalid elementa url: ${url}`);
    return undefined;
  }

  const key = url.slice("elementa:".length);
  const [resourceType, ...resourceId] = key.split(":");

  return {
    resourceType,
    resourceId: resourceId.join(":"),
  };
}
