import { CommandHandler } from "~/src/_types/managers/command";

export const toggleWireframe: CommandHandler = (interactor) => {
  interactor.setFlag("wireframe", !interactor.flag("wireframe"));
};
