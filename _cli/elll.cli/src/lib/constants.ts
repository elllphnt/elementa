import { homedir } from "os";
import path from "path";

export const SERVICE_NAME = "elllbuild-cli";
export const AUTH0_DOMAIN = "auth.elllephant.com";
export const CLIENT_ID = "pAupOhjArv9N2aomU8U7FtcL6H4vYqDJ";
export const AUTH_FILE_PATH = path.join(homedir(), ".elll", "credentials.json");
export const ELLL_WORKSPACE_ROOT = "components";
