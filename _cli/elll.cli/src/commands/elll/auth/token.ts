import { Command } from "commander";
import { getToken } from "../../../routines/auth/token.js";

export const tokenCommand = new Command("token")
  .description("print the current authentification token")
  .action(async () => {
    const token = await getToken();
    console.log(token);
  });
