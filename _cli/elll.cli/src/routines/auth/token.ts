// Importing necessary modules
import fs from "fs";
import path from "path";
import { AUTH_FILE_PATH } from "../../lib/constants.js";
import { refreshToken } from "../../modules/auth/refresh_token.js";
import { login } from "./login.js";

type TokenData = {
  access_token: string;
  refresh_token: string;
  exp: number;
};

// Load token file safely
function readTokenFile(): TokenData | null {
  if (!fs.existsSync(AUTH_FILE_PATH)) return null;

  try {
    const raw = fs.readFileSync(AUTH_FILE_PATH, "utf8");
    const data = JSON.parse(raw) as TokenData;
    return data;
  } catch (err) {
    console.error("Failed to parse token file:", err);
    return null;
  }
}

// Save token to disk with secure permissions
function saveTokenFile(data: TokenData) {
  const content = JSON.stringify(data, null, 2);
  fs.mkdirSync(path.dirname(AUTH_FILE_PATH), { recursive: true });
  fs.writeFileSync(AUTH_FILE_PATH, content, { mode: 0o600 });
}

export const getToken = async <R extends true | undefined>(
  required?: R,
): Promise<R extends true ? string : string | null> => {
  try {
    const tokenData = readTokenFile();

    const now = Math.floor(Date.now() / 1000);

    if (tokenData && tokenData.exp > now) {
      return tokenData.access_token as any;
    }

    if (tokenData && tokenData.refresh_token) {
      const newToken = await refreshToken(tokenData.refresh_token);
      saveTokenFile(newToken);
      return newToken.access_token as any;
    }

    if (required) {
      const newToken = await login();
      if (newToken) {
        saveTokenFile(newToken);
        return newToken.access_token as any;
      } else {
        throw new Error("Login failed");
      }
    }

    return null as any;
  } catch (error) {
    console.error("Error retrieving token:", error);
    if (required) {
      const newToken = await login();
      if (newToken) {
        saveTokenFile(newToken);
        return newToken.access_token as any;
      } else {
        throw new Error("Login failed");
      }
    }
    return null as any;
  }
};
