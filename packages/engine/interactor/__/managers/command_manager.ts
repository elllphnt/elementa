import { Lifecycle } from "@elllphnt/elementa-kernel";
import { ElementaInteractor } from "~/_types/interactor.js";
import { CommandHandler, ICommandManager } from "~/_types/managers/command.js";

export class CommandManager extends Lifecycle implements ICommandManager {
  private _commands: Map<string, CommandHandler> = new Map();
  readonly elementa: ElementaInteractor;

  constructor({ interactor }: { interactor: ElementaInteractor }) {
    super();
    this.elementa = interactor;
  }

  register(commandId: string, command: CommandHandler) {
    this._commands.set(commandId, command);
  }
  unregister(commandId: string) {
    this._commands.delete(commandId);
  }
  get(commandId: string) {
    return this._commands.get(commandId);
  }

  execute(commandId: string, ...args: any[]) {
    const command = this._commands.get(commandId);
    if (!command) {
      console.warn(`Command ${commandId} not found`);
      return;
    }
    command(this.elementa, ...args);
  }
}
