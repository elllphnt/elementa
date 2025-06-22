import { HookState } from "./hook.js";
import { InlineState } from "./inline.js";
import { ValueState } from "./value.js";

export type State = HookState | ValueState | InlineState;
