import { Disposable } from "@repo/utils";

export interface IKeyboardManager extends Disposable {
  handleKeyDown(e: KeyboardEvent): void;
  handleKeyUp(e: KeyboardEvent): void;
}
