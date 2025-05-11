import { Disposable } from "@elllphnt/elementa-utils";
import { IKeyboardManager } from "../_types/managers/keyboard";
import { ElementaInteractor } from "../elementa_interactor";
import { KeyMapper, KeyMapping } from "../keyboard/keymapper";

export class KeyboardManager extends Disposable implements IKeyboardManager {
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
