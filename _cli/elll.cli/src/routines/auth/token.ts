// Importing necessary modules
import fs from "fs";
import { AUTH_FILE_PATH } from "../../lib/constants.js";
import { refreshToken } from "../../modules/auth/refresh_token.js";
import {
  decrypt,
  encrypt,
  getEncryptionKey,
} from "../../modules/auth/security.js";
import { login } from "./login.js";

export const getToken = async <R extends true | undefined>(
  required?: R,
): Promise<R extends true ? string : string | null> => {
  try {
    const key = getEncryptionKey();
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const encryptedToken = fs.readFileSync(AUTH_FILE_PATH, "utf8");
      const token = decrypt(encryptedToken, key);
      const tokenData = JSON.parse(token);
      const now = Math.floor(Date.now() / 1000);
      if (tokenData.exp < now) {
        const newToken = await refreshToken(tokenData.refresh_token);
        fs.writeFileSync(
          AUTH_FILE_PATH,
          encrypt(JSON.stringify(newToken), key),
          { mode: 0o600 },
        );
        return newToken.access_token;
      }
      return tokenData.access_token;
    } else {
      if (required) {
        const token = await login();
        if (token) {
          return token.access_token;
        } else {
          throw new Error("Login failed");
        }
      }
      return null as R extends true ? string : string | null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error reading auth state:", error.message);
    } else {
      console.error("Error reading auth state:", error);
    }
    if (required) {
      const token = await login();
      if (token) {
        return token.access_token;
      } else {
        throw new Error("Login failed");
      }
    }
    return null as R extends true ? string : string | null;
  }
};
