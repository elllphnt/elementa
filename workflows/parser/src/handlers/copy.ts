import { Handler } from "../_types.js";

export const copyFile: Handler = async (path, content) => {
  return { path, content };
};
