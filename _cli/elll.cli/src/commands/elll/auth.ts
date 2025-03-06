import { Command } from "commander";
import { loginCommand } from "./auth/login.js";
import { logoutCommand } from "./auth/logout.js";

export const authCommand = new Command("auth").description(
  "manage Elll authentication",
);

authCommand.addCommand(loginCommand);
authCommand.addCommand(logoutCommand);
