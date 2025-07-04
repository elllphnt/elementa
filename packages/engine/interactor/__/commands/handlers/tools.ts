import type { CommandHandler } from "~/_types/managers/command";
import { tools } from "~/tools/_";

export const selectionTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Select);
};

export const frameTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Frame);
};

export const containerTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Container);
};

export const containerFilledTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.ContainerFilled);
};

export const textTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Text);
};

export const vectorTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Vector);
};

export const mediaTool: CommandHandler = (interactor) => {
  interactor.toolManager.setTool(tools.Media);
};
