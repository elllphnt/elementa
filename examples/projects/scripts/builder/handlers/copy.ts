import fs from "fs";
import { Handler } from "../_types.js";
import { writeFile } from "../_utils.js";

export const copyFile: Handler = async (srcPath, outPath) => {
  const content = fs.readFileSync(srcPath, "utf-8");
  writeFile(outPath, content);
};
