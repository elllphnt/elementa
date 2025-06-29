import { Component } from "@elllphnt/elementa-core";
import * as y from "yjs";
import { CrdtHookState } from "./hook.js";
import { CrdtInlineState } from "./inline.js";
import { CrdtValueState } from "./value.js";

export type CrdtState = CrdtValueState | CrdtHookState | CrdtInlineState;

export function CrdtcreateState({
  crdt,
  component,
  initialized,
}: {
  crdt: y.Map<any>;
  component: Component;
  initialized?: boolean;
}): CrdtState {
  const type = crdt.get("type");
  switch (type) {
    case "value":
      return new CrdtValueState({ crdt, component, initialized });
    case "hook":
      return new CrdtHookState({ crdt, component, initialized });
    case "inline":
      return new CrdtInlineState({ crdt, component, initialized });
    default:
      throw new Error(`Unknown state type: ${type}`);
  }
}
