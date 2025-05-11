import { IdentifiableData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  ReactiveMap,
  setEnhancer,
  setObjectGetter,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { genId } from "../../../_lib/id.js";
import { Identifiable } from "../../_interfaces/component/identifiable.js";

export function attachIdentifiable<S extends IdentifiableData>(
  identifiable: y.Map<any>
): identifiable is y.Map<any> & ReactiveMap<S> & Identifiable {
  assert(attachReactiveMap<S>(identifiable));

  if (!identifiable.doc || !identifiable.get("id")) {
    identifiable.set("id", genId() as any);
  }

  assert(setObjectGetter(identifiable, "id", () => identifiable.get("id")));

  return setEnhancer<Identifiable>(identifiable, attachIdentifiable);
}
