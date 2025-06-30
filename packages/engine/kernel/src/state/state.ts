import { Lifecycle } from "../lifecycle.js";
import { Backend } from "./backend.js";

export interface State extends Lifecycle {
  backend: Backend;
}
