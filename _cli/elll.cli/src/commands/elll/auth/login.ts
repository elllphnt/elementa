import { Command } from "commander";
import { login } from "../../../routines/auth/login.js";

export const loginCommand = new Command("login")
  .description("login to Elll")
  .action(async () => {
    await login();
  });
