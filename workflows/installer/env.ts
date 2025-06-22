import { defineEnv } from "@elllphnt/utils";
import dotenv from "dotenv";
dotenv.config();

export const env = defineEnv({
  ELLL_API_URL: {
    type: "string",
    required: true,
  },
  ELLL_API_AUDIENCE: {
    type: "string",
    required: true,
  },
  AUTH_ISSUER_URL: {
    type: "string",
    required: true,
  },
  AUTH_CLIENT_ID: {
    type: "string",
    required: true,
  },
  AUTH_CLIENT_SECRET: {
    type: "string",
    required: true,
  },
});
