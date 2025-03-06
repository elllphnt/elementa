import axios from "axios";
import { AUTH0_DOMAIN, CLIENT_ID } from "../../lib/constants.js";

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken,
      exp: Math.floor(Date.now() / 1000) + response.data.expires_in,
    };
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      throw new Error(`Error refreshing token: ${error.response?.data.error}`);
    } else {
      throw new Error(`Error refreshing token: ${error}`);
    }
  }
};
