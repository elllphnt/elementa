// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "\\./_(\\.js)?$",
              message:
                "Avoid '../_': it creates an implicit cyclic import. Use a specific folder like '../foo/_' instead.",
            },
          ],
        },
      ],
    },
  }
);
