export function makeElllResourceUrl(id: string) {
  return `elll:${id}`;
}
export function parseElllResourceUrl(url: string) {
  const id = url.slice(5);
  return { id };
}
export function isElllResourceUrl(url: string) {
  return url.startsWith("elll:");
}
