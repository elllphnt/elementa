import type { Lifecycle } from "@elllphnt/elementa-utils";
import type { ElementaInteractor } from "../interactor.js";

export type CommandHandler<A extends any[] = unknown[]> = (
  interactor: ElementaInteractor,
  ...args: A
) => void;

export interface ICommandManager extends Lifecycle {
  register(commandId: string, command: CommandHandler): void;
  unregister(commandId: string): void;
  get(commandId: string): CommandHandler | undefined;
  execute(commandId: string, ...args: any[]): void;
}
