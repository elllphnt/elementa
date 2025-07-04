import type { Lifecycle } from "../lifecycle.js";
import type { Backend } from "./backend.js";

export interface State extends Lifecycle {
  backend: Backend;
}
