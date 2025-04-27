import { ElementData } from "@elllphnt/elll-element";
import * as y from "yjs";
import { Component } from "../component";
import { Element } from "./element";

export function createElement(ymap: y.Map<any>, component: Component): Element {
  const type = ymap.get("type") as ElementData["type"];
}
