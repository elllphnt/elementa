import { Command } from "commander";
import { logout } from "../../../routines/auth/logout.js";

export const logoutCommand = new Command("logout")
  .description("logout from Elll")
  .action(async () => {
    await logout();
  });
