import { Lifecycle } from "@elllphnt/elementa-utils";

export interface IKeyboardManager extends Lifecycle {
  handleKeyDown(e: KeyboardEvent): void;
  handleKeyUp(e: KeyboardEvent): void;
}
