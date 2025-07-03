import { CommandHandler } from "~/_types/managers/command";

export const toggleWireframe: CommandHandler = (interactor) => {
  interactor.setFlag("wireframe", !interactor.flag("wireframe"));
};
