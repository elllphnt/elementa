import fs from "fs";
import { AUTH_FILE_PATH } from "../../lib/constants.js";

// Function to logout and clear authentication state
export const logout = async () => {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      fs.unlinkSync(AUTH_FILE_PATH);
      console.log("Successfully logged out.");
    } else {
      console.log("No authentication token found to logout.");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during logout:", error.message);
    } else {
      console.error("Error during logout:", error);
    }
  }
};
