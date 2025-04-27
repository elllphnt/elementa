import { Disposable } from "@elllphnt/elementa-utils";

export interface IKeyboardManager extends Disposable {
  handleKeyDown(e: KeyboardEvent): void;
  handleKeyUp(e: KeyboardEvent): void;
}
