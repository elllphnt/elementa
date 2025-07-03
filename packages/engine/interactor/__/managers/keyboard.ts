import { Lifecycle } from "@elllphnt/elementa-kernel";
import { IKeyboardManager } from "~/_types/managers/keyboard.js";
import { ElementaInteractor } from "~/interactor.js";
import { KeyMapper, KeyMapping } from "~/keyboard/keymapper.js";

export class KeyboardManager extends Lifecycle implements IKeyboardManager {
  readonly interactor: ElementaInteractor;
  readonly keyMapper: KeyMapper;

  private _keys = new Set<string>();

  constructor({
    interactor,
    keymap,
  }: {
    interactor: ElementaInteractor;
    keymap?: KeyMapping[];
  }) {
    super();
    this.interactor = interactor;
    this.keyMapper = new KeyMapper({ keymap });
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const keyString = KeyMapper.stringOf(e);
    const keyMapping = this.keyMapper.get(keyString);
    if (!keyMapping) return;

    e.preventDefault();
    this.interactor.commandManager.execute(keyMapping.command);
  };

  handleKeyUp = (e: KeyboardEvent) => {
    this._keys.delete(e.key);
  };
}
