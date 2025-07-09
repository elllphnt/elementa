import { JSDOM } from "jsdom";

export function setupJSDOM() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  globalThis.window = dom.window as any;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
}

export function setupEnv() {
  setupJSDOM();
}
