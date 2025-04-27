import { Disposable } from "@elllphnt/elementa-utils";
import { IElementaInteractor } from "../interactor";

export type CommandHandler<A extends any[] = unknown[]> = (
  interactor: IElementaInteractor,
  ...args: A
) => void;

export interface ICommandManager extends Disposable {
  register(commandId: string, command: CommandHandler): void;
  unregister(commandId: string): void;
  get(commandId: string): CommandHandler | undefined;
  execute(commandId: string, ...args: any[]): void;
}
