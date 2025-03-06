// Importing necessary modules
import axios from "axios";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import {
  AUTH0_DOMAIN,
  AUTH_FILE_PATH,
  CLIENT_ID,
} from "../../lib/constants.js";
import { encrypt, getEncryptionKey } from "../../modules/auth/security.js";

// Function to run device flow for login
export const login = async () => {
  try {
    console.log("Logging in...");

    const response = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/device/code`,
      {
        client_id: CLIENT_ID,
        audience: "https://api.elllephant.com",
        scope: "offline_access", // Include offline_access scope
      },
    );

    let { device_code, user_code, verification_uri, interval } = response.data;

    console.log(
      [
        ``,
        `To authorize the CLI, first copy this code:`,
        `📋 ${chalk.bold(user_code)}`,
        ``,
        `Then visit the following URL in your browser:`,
        `🌐 ${chalk.blue(verification_uri)}`,
        `to complete the login process.`,
        ``,
      ].join("\n"),
    );

    const pollForToken = async (): Promise<any> => {
      try {
        const tokenResponse = await axios.post(
          `https://${AUTH0_DOMAIN}/oauth/token`,
          {
            client_id: CLIENT_ID,
            device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          },
        );
        if (tokenResponse.data.access_token) {
          return {
            access_token: tokenResponse.data.access_token,
            refresh_token: tokenResponse.data.refresh_token,
            exp: Math.floor(Date.now() / 1000) + tokenResponse.data.expires_in,
          };
        }
      } catch (error: any) {
        if (error.response?.data.error === "authorization_pending") {
          return null; // Keep polling
        } else if (error.response?.data.error === "slow_down") {
          interval += 5; // Increase polling interval if requested
        } else {
          throw new Error(
            `Error during polling: ${error.response?.data.error}`,
          );
        }
      }
      return null;
    };

    let token = null;
    while (!token) {
      await new Promise((res) => setTimeout(res, interval * 1000));
      token = await pollForToken();
    }

    // Store token securely in a file with restricted permissions
    const dir = path.dirname(AUTH_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const key = getEncryptionKey();
    fs.writeFileSync(AUTH_FILE_PATH, encrypt(JSON.stringify(token), key), {
      mode: 0o600,
    });
    console.log("Login successful. Token stored securely.");

    return token;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during login:", error.message);
    } else {
      console.error("Error during login:", error);
    }
  }
};
