export function arrayBufferToText(arrayBuffer: ArrayBuffer) {
  return new TextDecoder().decode(arrayBuffer);
}
export function textToArrayBuffer(text: string) {
  return new TextEncoder().encode(text);
}
export function arrayBufferFrom(data: string | ArrayBuffer) {
  return typeof data === "string" ? textToArrayBuffer(data) : data;
}
